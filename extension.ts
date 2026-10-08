import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// GNOME Shell's private gesture fields are outside its public type declarations.
interface TouchpadGesture {
    enabled: boolean;
    connect(signal: 'notify::enabled', callback: () => void): number;
    disconnect(id: number): void;
}

interface OverviewTracker {
    enabled: boolean;
    orientation: Clutter.Orientation;
    _touchpadGesture?: TouchpadGesture;
}

interface GestureState {
    tracker: OverviewTracker;
    gesture: TouchpadGesture;
    previousEnabled: boolean;
    previousTrackerEnabled: boolean;
    enabledChangedId: number;
}

export default class DisableOverviewSwipe extends Extension {
    private _state: GestureState | null = null;

    enable(): void {
        const overview = Main.overview as unknown as {_swipeTracker?: OverviewTracker};
        const tracker = overview?._swipeTracker;
        const gesture = tracker?._touchpadGesture;
        if (!tracker || !gesture || tracker.orientation !== Clutter.Orientation.VERTICAL)
            throw new Error('GNOME 51 vertical overview touchpad tracker is unavailable');

        const previousEnabled = gesture.enabled;
        const previousTrackerEnabled = tracker.enabled;

        // Shell binds the parent tracker's enabled property to this gesture.
        // Keep the touchpad disabled when that binding updates it.
        const enabledChangedId = gesture.connect('notify::enabled', () => {
            if (gesture.enabled)
                gesture.enabled = false;
        });
        this._state = {tracker, gesture, previousEnabled, previousTrackerEnabled, enabledChangedId};
        gesture.enabled = false;
    }

    disable(): void {
        const state = this._state;
        if (!state)
            return;

        state.gesture.disconnect(state.enabledChangedId);
        state.gesture.enabled = state.tracker.enabled === state.previousTrackerEnabled
            ? state.previousEnabled
            : state.tracker.enabled;
        this._state = null;
    }
}

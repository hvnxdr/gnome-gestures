import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class DisableOverviewSwipe extends Extension {
    enable() {
        const tracker = Main.overview?._swipeTracker;
        const gesture = tracker?._touchpadGesture;
        if (!gesture || tracker.orientation !== Clutter.Orientation.VERTICAL)
            throw new Error('GNOME 51 vertical overview touchpad tracker is unavailable');

        this._tracker = tracker;
        this._gesture = gesture;
        this._previousEnabled = gesture.enabled;
        this._previousTrackerEnabled = tracker.enabled;

        // Shell binds the parent tracker's enabled property to this gesture.
        // Keep the touchpad disabled when that binding updates it.
        this._enabledChangedId = gesture.connect('notify::enabled', () => {
            if (gesture.enabled)
                gesture.enabled = false;
        });
        gesture.enabled = false;
    }

    disable() {
        if (!this._gesture)
            return;

        this._gesture.disconnect(this._enabledChangedId);
        this._gesture.enabled = this._tracker.enabled === this._previousTrackerEnabled
            ? this._previousEnabled
            : this._tracker.enabled;

        this._enabledChangedId = null;
        this._gesture = null;
        this._tracker = null;
        this._previousEnabled = null;
        this._previousTrackerEnabled = null;
    }
}

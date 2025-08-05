/* prefs.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class AccentDirsPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const preferences = this.getSettings();
        const page = new Adw.PreferencesPage({
            title: _('General'),
            iconName: 'dialog-information-symbolic',
        });
        // Add custom light theme selection group
        const ThemeGroupLight = new Adw.PreferencesGroup({
            title: _('Custom User Themes Light'),
            description: _('Select custom user shell theme for each accent color'),
        });
        page.add(ThemeGroupLight);
        // Get available user shell themes
        const userThemesLight = this._getAvailableUserThemes();
        // Create dropdown for each accent color
        const accentColorsLight = [
            'blue', 'teal', 'green', 'yellow',
            'orange', 'red', 'pink', 'purple', 'slate'
        ];
        accentColorsLight.forEach(color => {
            const row = new Adw.ComboRow({
                title: _(color.charAt(0).toUpperCase() + color.slice(1)),
                model: this._createUserThemeModel(userThemesLight),
                selected: this._getSelectedIndexLight(preferences, color, userThemesLight)
            });
            row.connect('notify::selected', () => {
                const selected = userThemesLight[row.selected];
                preferences.set_string(`${color}-theme-light`, selected);
            });
            ThemeGroupLight.add(row);
        });
        // Add custom dark theme selection group
        const ThemeGroupDark = new Adw.PreferencesGroup({
            title: _('Custom User Themes Dark'),
            description: _('Select custom user shell theme for each accent color'),
        });
        page.add(ThemeGroupDark);
        // Get available user shell themes
        const userThemesDark = this._getAvailableUserThemes();
        // Create dropdown for each accent color
        const accentColorsDark = [
            'blue', 'teal', 'green', 'yellow',
            'orange', 'red', 'pink', 'purple', 'slate'
        ];
        accentColorsDark.forEach(color => {
            const row = new Adw.ComboRow({
                title: _(color.charAt(0).toUpperCase() + color.slice(1)),
                model: this._createUserThemeModel(userThemesDark),
                selected: this._getSelectedIndexDark(preferences, color, userThemesDark)
            });
            row.connect('notify::selected', () => {
                const selected = userThemesDark[row.selected];
                preferences.set_string(`${color}-theme-dark`, selected);
            });
            ThemeGroupDark.add(row);
        });
        window.add(page);
        return Promise.resolve();
    }

    // Next method load the themes in declarated dirs an then return the list with themes
    _getAvailableUserThemes() {
        const themes = new Set();
        const directories = [
            '/usr/local/share/themes',
            '/usr/share/themes',
            GLib.get_home_dir() + '/.local/share/themes',
            GLib.get_home_dir() + '/.themes'
        ];
        // Scan directories for user themes
        directories.forEach(dir => {
            if (GLib.file_test(dir, GLib.FileTest.IS_DIR)) {
                const directory = Gio.File.new_for_path(dir);
                const enumerator = directory.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NONE, null);
                let info;
                while ((info = enumerator.next_file(null))) {
                    const path = dir + '/' + info.get_name();
                    if (this._isValidUserTheme(path)) {
                        themes.add(info.get_name());
                    }
                }
            }
        });
        return Array.from(themes).sort();
    }

    // Next method is used to check if in a path exist a theme (check if index.theme file exist)
    _isValidUserTheme(path) {
        return GLib.file_test(path + '/index.theme', GLib.FileTest.EXISTS);
    }

    // Next return a list with themes
    _createUserThemeModel(themes) {
        return new Gtk.StringList({ strings: themes });
    }

    // Next method return theme selected used for Ligh scheme
    _getSelectedIndexLight(preferences, color, themes) {
        const savedTheme = preferences.get_string(`${color}-theme-light`);
        const theme = savedTheme;
        return Math.max(0, themes.indexOf(theme));
    }
    
    // Next method return theme selected used for Dark scheme
    _getSelectedIndexDark(preferences, color, themes) {
        const savedTheme = preferences.get_string(`${color}-theme-dark`);
        const theme = savedTheme;
        return Math.max(0, themes.indexOf(theme));
    }
}

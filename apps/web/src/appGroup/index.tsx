import { ShellApp } from "@gem/shared";
import { TripPlannerApp } from "./TripPlannerApp/index.js";
import { TextEditorApp } from "./TextEditorApp/index.js";

const AppGroup = (): ShellApp[] => {
    return [
        {
            id: 'tripplanner',
            name: 'Gem Charak',
            icon: '🧳',
            component: TripPlannerApp,
        },
        {
            id: 'texteditor',
            name: 'Gem Likhit',
            icon: '📝',
            component: TextEditorApp,
        }
    ]
}

export default AppGroup;
import { ShellApp } from "@gem/shared";
import { TripPlannerApp } from "./TripPlannerApp/index.js";
import { TextEditorApp } from "./TextEditorApp/index.js";
import { InvitationApp } from "./InvitationApp/index.js";
import { ResumeMakerApp } from "./ResumeMakerApp/index.js";
import { TripIcon } from "./icons/trip.js";
import { WriteIcon } from "./icons/write.js";
import { InviteIcon } from "./icons/invite.js";
import { CVIcon } from "./icons/cv.js";
import { ProfileIcon } from "./icons/profile.js";
import { ProfileApp } from "./ProfileApp/index.js";

const AppGroup = (): ShellApp[] => {
    return [
        {
            id: 'profile',
            name: 'Gem Profile',
            icon: <ProfileIcon />,
            component: ProfileApp,
        },
        // {
        //     id: 'resumemaker',
        //     name: 'Gem Vivrad',
        //     icon: <CVIcon />,
        //     component: ResumeMakerApp,
        // },
        {
            id: 'texteditor',
            name: 'Gem Likhit',
            icon: <WriteIcon />,
            component: TextEditorApp,
        },
        {
            id: 'tripplanner',
            name: 'Gem Musafir',
            icon: <TripIcon />,
            component: TripPlannerApp,
        },
        {
            id: 'invitation',
            name: 'Gem Amantrada',
            icon: <InviteIcon />,
            component: InvitationApp,
        }
    ]
}

export default AppGroup;
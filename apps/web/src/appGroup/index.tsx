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
import { GemVitya} from "./GemVitya/GemVitya.js";

const AppGroup = (): ShellApp[] => {
    return [
        {
            id: 'profile',
            name: 'Gem Profile',
            description: 'Manage your identity, API keys, and user settings.',
            icon: <ProfileIcon />,
            component: ProfileApp,
        },
        {
            id: 'resumemaker',
            name: 'Gem Vivarad',
            description: 'AI-powered resume, cover letter, and SOP builder.',
            icon: <CVIcon />,
            component: ResumeMakerApp,
        },
        {
            id: 'texteditor',
            name: 'Gem Likhit',
            description: 'Context-aware writing assistant for drafting and editing.',
            icon: <WriteIcon />,
            component: TextEditorApp,
        },
        {
            id: 'tripplanner',
            name: 'Gem Musafir',
            description: 'Plan personalized travel itineraries with AI insights.',
            icon: <TripIcon />,
            component: TripPlannerApp,
        },
        {
            id: 'invitation',
            name: 'Gem Amantrada',
            description: 'Design elegant digital invitations for any occasion.',
            icon: <InviteIcon />,
            component: InvitationApp,
        },
        {
            id: 'finance',
            name: 'Gem Vitya',
            description: 'AI-driven personal finance insights and budgeting tools.',
            icon: <ProfileIcon />, // Placeholder icon
            component: GemVitya,
        }
    ]
}

export default AppGroup;
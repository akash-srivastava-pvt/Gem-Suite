import { useState } from "react";
import {
    InvitationTheme,
    InvitationInput,
    WizardState,
} from "@gem/shared";
import { invitationService } from "../services/invitationService.js";

export function useInvitationWizard() {
    const [state, setState] = useState<WizardState>({
        step: 1,
    });

    const selectTheme = (theme: InvitationTheme) =>
        setState({ step: 2, theme });

    const updateForm = (data: InvitationInput) =>
        setState((s) => ({ ...s, formData: data }));

    const next = () =>
        setState((s) => ({ ...s, step: (s.step + 1) as any }));

    const back = () =>
        setState((s) => ({ ...s, step: (s.step - 1) as any }));

    const generate = async () => {
        if (!state.formData || !state.theme) return;

        setState((s) => ({ ...s, loading: true }));

        const image = await invitationService.query(
            state.formData,
            state.theme
        );

        const imageUrl = `data:${image.image.mimeType};base64,${image.image.base64}`;

        setState((s) => ({
            ...s,
            loading: false,
            imageUrl,
            step: 3,
        }));
    };

    const reset = () => {
        setState({ step: 1 });
    };

    return {
        state,
        selectTheme,
        updateForm,
        next,
        back,
        generate,
        reset,
    };
}

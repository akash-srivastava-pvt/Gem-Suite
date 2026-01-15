import { useState, useEffect } from "react";
import {
    InvitationTheme,
    InvitationInput,
    WizardState,
} from "@gem/shared";
import { invitationService } from "../services/invitationService.js";
import { formStorage, aiCache } from "../../../utils/storage.js";

const APP_NAME = "invitation";

export function useInvitationWizard() {
    // Load persisted state from localStorage
    const persistedState = formStorage.load<WizardState>(APP_NAME, { step: 1 });
    
    const [state, setState] = useState<WizardState>(persistedState);

    // Persist state changes to localStorage
    useEffect(() => {
        if (state.step > 1 || state.theme || state.formData) {
            formStorage.save(APP_NAME, state);
        }
    }, [state]);

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

        // Check cache first
        const cacheKey = { formData: state.formData, theme: state.theme };
        const cached = aiCache.get<{ imageUrl: string }>(APP_NAME, cacheKey);
        
        if (cached) {
            setState((s) => ({
                ...s,
                loading: false,
                imageUrl: cached.imageUrl,
                step: 3,
            }));
            return;
        }

        setState((s) => ({ ...s, loading: true }));

        try {
            const image = await invitationService.query(
                state.formData,
                state.theme
            );

            const imageUrl = `data:${image.image.mimeType};base64,${image.image.base64}`;

            // Cache the result
            aiCache.set(APP_NAME, cacheKey, { imageUrl });

            setState((s) => ({
                ...s,
                loading: false,
                imageUrl,
                step: 3,
            }));
        } catch (error) {
            setState((s) => ({
                ...s,
                loading: false,
            }));
            throw error;
        }
    };

    const reset = () => {
        setState({ step: 1 });
        formStorage.clear(APP_NAME);
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

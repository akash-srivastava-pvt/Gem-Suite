import { InvitationInput, GeminiImgResponse } from "@gem/shared";
import { persistenceService } from "../../../services/persistenceService.js";

const API_BASE = "/api/v1/invitation";
export const invitationService = {
    async query(
        data: InvitationInput,
        key: string
    ): Promise<GeminiImgResponse> {
        const response = await fetch(`${API_BASE}/${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data }),
        });

        if (!response.ok) {
            let errorMessage = "Invitation generation failed";
            try {
                const err = await response.json();
                errorMessage = err.error || errorMessage;
            } catch {
                // fallback to text
                errorMessage = await response.text();
            }
            throw new Error(errorMessage);
        }

        const res = await response.json();

        if (!res.image?.base64 || !res.image?.mimeType) {
            throw new Error("Invalid image response from server");
        }

        return res;
    },
};

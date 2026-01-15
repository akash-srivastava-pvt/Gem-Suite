import { Request, Response } from 'express';
import { UserModel } from '../models/userModel.js';
import { LoggerModel } from '../models/loggerModel.js';

export const UserController = {
    getStatus: (req: Request, res: Response) => {
        try {
            const user = UserModel.getUser();
            return res.json({
                agreed: user ? !!user.personalAgreement : false,
                name: user?.name,
                geminiVersion: user?.geminiVersion || '2',
            });
        } catch (error) {
            console.error('[USER][GET_STATUS]', error);
            return res.status(500).json({ error: 'Failed to get user status' });
        }
    },

    updateGeminiVersion: (req: Request, res: Response) => {
        try {
            const { version } = req.body;
            if (version !== '2' && version !== '3') {
                return res.status(400).json({ error: 'Version must be "2" or "3"' });
            }
            UserModel.updateGeminiVersion(version);
            return res.json({ success: true, geminiVersion: version });
        } catch (error) {
            console.error('[USER][UPDATE_GEMINI_VERSION]', error);
            return res.status(500).json({ error: 'Failed to update Gemini version' });
        }
    },

    agree: (req: Request, res: Response) => {
        try {
            const { name } = req.body;

            if (!name || typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({ error: 'Name is required' });
            }

            if (UserModel.hasAgreed()) {
                return res.status(409).json({ error: 'Agreement already exists' });
            }

            UserModel.createUser(name.trim());

            return res.status(201).json({
                success: true,
                message: 'Agreement recorded successfully',
            });
        } catch (error) {
            console.error('[USER][AGREE]', error);
            return res.status(500).json({ error: 'Failed to record agreement' });
        }
    },

    getLogs: (req: Request, res: Response) => {
        try {
            const logs = LoggerModel.getLogs();
            return res.json(logs);
        } catch (error) {
            console.error('[USER][GET_LOGS]', error);
            return res.status(500).json({ error: 'Failed to fetch logs' });
        }
    },

    deleteData: (req: Request, res: Response) => {
        try {
            UserModel.deleteData();
            return res.json({ success: true, message: 'All data except logs deleted' });
        } catch (error) {
            console.error('[USER][DELETE_DATA]', error);
            return res.status(500).json({ error: 'Failed to delete data' });
        }
    },
};

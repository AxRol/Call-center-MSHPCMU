import pool from '../config/db.js';

import { getOneTypeAppel, getAllTypeAppel, addTypeAppel, updateTypeAppel, archiveTypeAppel} from '../models/typeAppelModel.js';

export const getTypeAppelByID = async (req, res) => {
    await getOneTypeAppel(req, res);
};

export const getTypeAppel = async (req, res) => {
    await getAllTypeAppel(req, res);
};

export const createTypeAppel = async (req, res) => {
    await addTypeAppel(req, res);
};

export const editTypeAppel = async (req, res) => {
    await updateTypeAppel(req, res);
};

export const deleteTypeAppel = async (req, res) => {
    await archiveTypeAppel(req, res);
};


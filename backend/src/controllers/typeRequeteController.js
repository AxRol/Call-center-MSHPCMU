import pool from '../config/db.js';
import { getAllTypeRequete, getOneTypeRequete, addTypeRequete, updateTypeRequete, archiveTypeRequete } from '../models/typeRequeteModel.js';

export const getTypeRequete = async (req, res) => {
    await getAllTypeRequete(req, res);
};

export const getTypeRequeteByID = async (req, res) => {
    await getOneTypeRequete(req, res);
}; 

export const createTypeRequete = async (req, res) => {
    await addTypeRequete(req, res);
};

export const editTypeRequete = async (req, res) => {
    await updateTypeRequete(req, res);
}; 

export const deleteTypeRequete = async (req, res) => {
    await archiveTypeRequete(req, res);
};

import {
  getAllLocalite,
  getOneLocalite,
  addLocalite,
  updateLocalite,
  archiveLocalite,
} from "../models/localiteModel.js";

export const getLocalite = async (req, res) => {
  await getAllLocalite(req, res);
};

export const getLocaliteByID = async (req, res) => {
  await getOneLocalite(req, res);
};

export const createLocalite = async (req, res) => {
  await addLocalite(req, res);
};

export const editLocalite = async (req, res) => {
  await updateLocalite(req, res);
};

export const deleteLocalite = async (req, res) => {
  await archiveLocalite(req, res);
};

import { getAllUser, getOneUser, addUser, updateUser, archiveUser, assignEquipe } from "../models/userModel.js";

export const getUser = async (req, res) => {
  await getAllUser(req, res);
};

export const getUserByID = async (req, res) => {
  await getOneUser(req, res);
};

export const createUser = async (req, res) => {
  await addUser(req, res);
};

export const editUser = async (req, res) => {
  await updateUser(req, res);
};

export const deleteUser = async (req, res) => {
  await archiveUser(req, res);
};

export const assignUserEquipe = async (req, res) => {
  await assignEquipe(req, res);
};

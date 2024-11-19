import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    username: { type: String, require: true },
    authentication: {
        password: {
            type: String,
            require: true,
            select: false,
        },
        salt: {
            type: String,
            select: false,
        },
        sessionToken: {
            type: String,
            select: false,
        },
    },
}, {
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});
export const userModel = mongoose.model("User", userSchema);
export const getUsers = () => userModel.find();
export const getUserByEmail = (email) => userModel.findOne({ email });
export const getUserBySessionToken = (sessionToken) => userModel.findOne({ "authentication.sessionToken": sessionToken });
export const getUserById = (id) => userModel.findById({ id });
export const createUser = (values) => new userModel(values).save().then((user) => user.toObject());
export const deleteUserById = (id) => userModel.findByIdAndDelete({ _id: id });
export const updateUserById = (id, values) => userModel.findByIdAndUpdate(id, values);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    },
    lastName: {
        type: String,
        trim: true,
        maxLength: 50,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
        unique: true,
        minLength: 3,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    }
});
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=user.js.map
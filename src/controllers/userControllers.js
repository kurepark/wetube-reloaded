import { response } from "express";
import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import { render } from "pug";

export const getJoin = (req, res) => {
    return res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    const pageTitle = "Join"

    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "password confirmation dose not match"
        })
    }

    const exists = await User.exists({ $or: [{ username }, { email }] });

    if (exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: `this username/email is already taken`,
        });
    }
    try {
        await User.create({
            name,
            username,
            email,
            password,
            location
        });
        res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: error._message,
        });
    }
}
export const getLogin = (req, res) => {
    return res.render("login", { pageTitle: "Login" });
};
export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ username, socialOnly: false });
    if (!user) {
        return res.status(400).render("login", { pageTitle, errorMessage: "an account with this username does not exists." });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
        return res.status(400).render("login", { pageTitle, errorMessage: "Wrong password" });
    }
    req.session.loggedIn = true;
    req.session.user = user; // adding information to session
    return res.redirect("/");
};
export const startGithubLogin = (req, res) => {
    const baseUrl = `https://github.com/login/oauth/authorize`;
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email"
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            }
        })
    ).json();
    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();

        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if (!user) {
            user = await User.create({
                avartUrl: userData.avatar_url,
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};

export const logout = (req, res) => {
    req.session.destroy();
    req.flash("info", "bye bye")
    return res.redirect("/");
}

export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
}
export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id, avatarUrl }
        }, // ?????? ????????? ??????
        body: { name, email, username, location }, // edit form ?????? ????????? ??????
        file,
    } = req;

    const existUsername = await User.exists({
        username,
        _id: { $ne: _id }
    });

    const existEmail = await User.exists({
        email,
        _id: { $ne: _id }
    });

    if (existUsername || existEmail) {
        const errorMessage = existUsername ? "?????? ????????? ???????????????." : "????????? ?????????????????? ????????????.";
        return res.status(400).render("edit-profile", {
            pageTitle: "Edit Profile",
            errorMessage
        });
    } else {
        const updateUser = await User.findByIdAndUpdate(_id, {
            avatarUrl: file ? file.location : avatarUrl, // ?????? ????????? ????????? avatarUrl ??????, ????????? file.path ??????
            name,
            username,
            email,
            location,
        },
            { new: true });

        req.session.user = updateUser;
    }

    return res.redirect("/users/edit");
}

export const getChangePassword = (req, res) => {
    if (req.session.user.socialOnly === true) {
        req.flash("error", "can't change password.");
        return res.redirect("/");
    }
    return res.render("users/change-password", {
        pageTitle: "Change Password"
    })
}
export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        body: {
            oldPassword,
            newPassword,
            newPasswordConfirmation
        }
    } = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "?????? ??????????????? ????????????."
        })
    }
    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change password",
            errorMessage: "??? ??????????????? ????????????."
        })
    }

    user.password = newPassword;
    await user.save();
    req.flash("info", "Password update")
    return res.redirect("/users/logout");
}
export const remove = (req, res) => res.send("Delete User");
export const see = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User"
        }
    });
    if (!user) {
        return res.status(400).render("404", { pageTitle: "User not found." });
    }

    return res.render("users/profile", { pageTitle: `${user.name} profile`, user: user })
}
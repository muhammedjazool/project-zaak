const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const SubCategory = require("../../model/subCategoryModel");
const Banner = require("../../model/bannerModel");
const cloudinary = require("../../config/cloudinary");
const mongoose = require("mongoose");




exports.loadBanners = async (req, res) => {
    try {
        const bannerData = await Banner.find();

        if (req.session.bannerSave) {
            res.render("banners", {
                title: "Banner",
                bannerData,
                user: req.session.admin,
            });
            req.session.bannerSave = false;
        } else if (req.session.bannerExist) {
            res.render("banners", {
                title: "Banner",
                bannerData,
                user: req.session.admin,
            });
            req.session.bannerExist = false;
        } else if (req.session.bannerUpdate) {
            res.render("banners", {
                title: "Banner",
                bannerData,
                user: req.session.admin,
            });
            req.session.bannerUpdate = false;
        } else if (req.session.bannerDelete) {
            res.render("banners", {
                title: "Banner",
                bannerData,
                user: req.session.admin,
            });
            req.session.bannerDelete = false;
        } else {
            res.render("banners", { title: "Banner", bannerData, user: req.session.admin });
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports.addBanner = async (req, res) => {
    try {
        res.render("addBanner", { title: "Add Banner", user: req.session.admin });
    } catch (error) {
        console.log(error.message);
    }
};

exports.addNewBanner = async (req, res) => {
    try {
        const { title, label, bannerSubtitle } = req.body;
        const image = req.file;

        const existing = await Banner.findOne({ title: title });
        if (existing) {
            req.session.bannerExist = true;
            res.redirect("/admin/banners");
        } else {
            const result = await cloudinary.uploader.upload(image.path, {
                folder: "Banners",
            });

            const banner = new Banner({
                title: title,
                subtitle: bannerSubtitle,
                label: label,
                image: {
                    public_id: result.public_id,
                    url: result.secure_url,
                },
            });

            await banner.save();
            req.session.bannerSave = true;
            res.redirect("/admin/banners");
        }
    } catch (error) {
        console.log(error.messaage);
    }
};

exports.editBanner = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const bannerData = await Banner.findById({ _id: bannerId });

        res.render("editBanner", { title: "Edit Banner", bannerData, user: req.session.admin });
    } catch (error) {
        console.log(error.message);
    }
};

exports.updateBanner = async (req, res) => {
    try {

        const { title, label, bannerSubtitle } = req.body;

        const bannerId = req.params.id;

        const newImage = req.file;

        const banner = await Banner.findById(bannerId);

        const bannerImageUrl = banner.image.url;


        let result;
        if (newImage) {

            if (bannerImageUrl) {

                await cloudinary.uploader.destroy(banner.image.public_id);
            }
            result = await cloudinary.uploader.upload(newImage.path, {
                folder: "Banners",
            });
        } else {

            result = {
                public_id: banner.image.public_id,
                secure_url: bannerImageUrl,
            };
        }

        const bannerExist = await Banner.findOne({ title: title });
        const imageExist = await Banner.findOne({ "image.url": result.secure_url });

        if (!bannerExist || !imageExist) {

            await Banner.findByIdAndUpdate(
                bannerId,
                {
                    title: title,
                    subtitle: bannerSubtitle,
                    image: {
                        public_id: result.public_id,
                        url: result.secure_url,
                    },
                    label: label,
                },
                { new: true }
            );
            req.session.bannerUpdate = true;
            res.redirect("/admin/banners");
        } else {
            console.log(157, "bannerupdate");
            req.session.bannerExist = true;
            res.redirect("/admin/banners");
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports.bannerStatus = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const unlistBanner = await Banner.findById(bannerId);
        await Banner.findByIdAndUpdate(bannerId, { $set: { active: !unlistBanner.active } }, { new: true });

        res.redirect("/admin/banners");
    } catch (error) {
        console.log(error.message);
    }
};
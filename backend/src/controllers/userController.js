const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { USER_ROLES } = require("../utils/constants");

const listProviders = asyncHandler(async (_req, res) => {
  const providerDocs = await User.find({ role: USER_ROLES.PROVIDER })
    .select("_id name email")
    .sort({ name: 1 });

  const providers = providerDocs.map((provider) => ({
    id: String(provider._id),
    name: provider.name,
    email: provider.email,
    role: USER_ROLES.PROVIDER
  }));

  return res.status(200).json({ providers });
});

module.exports = {
  listProviders
};

export default async (req, res) => {
  res.json(req.user.account.static_token);
};

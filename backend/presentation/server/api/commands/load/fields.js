import * as Permissions from '../../../../../business/security/permissions.js';

export default async (req, res) => {
  const { model, sandbox, params } = req;
  const { accessible = true } = params;

  try {
    const fields = await Permissions.getPermittedFields(model, sandbox, { accessible });

    res.json({ data: fields });
  } catch (error) {
    res.error(error);
  }
};

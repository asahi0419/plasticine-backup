import Processor from '../../../../business/filter/processor/index.js';

export default async (req, res) => {
  const { model, sandbox, query: { filter } } = req;

  try {
    const result = await new Processor(model, sandbox, { humanize: true }).perform(filter);

    res.json({ data: result });
  } catch (error) {
    res.error(error);
  }
};

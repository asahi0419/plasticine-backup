import { toNumber } from "lodash";

export const getFormData = (event) => {
    const {target} = event;
    const linkToRecord = target._private.data?.linkToRecord;
    if (linkToRecord) {
        const linkToArray = linkToRecord.split('/');
        const modelAndRecordData = {
            model: linkToArray[1],
            record: toNumber(linkToArray[3]),
        }
        return modelAndRecordData;
    } else {
        return false;
    }
}
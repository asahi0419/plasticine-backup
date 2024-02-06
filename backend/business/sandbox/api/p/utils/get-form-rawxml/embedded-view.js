import rgbHex from "rgb-hex";

import db from '../../../../../../data-layer/orm/index.js';
import { genRawXmlByTemplate } from "../get-view-rawxml/gridview.js";
import { SectionXmlTemplate, ImagePlaceholderTemplate } from "./form-templates.js";
import logger from '../../../../../logger/index.js';
import { getOptions, getParams, isValidXml } from './related-view.js'

export var imageStyleEmbeddedViewParams = [];

const swapClientParams = (props, options, relatedViews) => {
    let newOptions, isExist=false;
    for (let [key, relatedView] of Object.entries(relatedViews)) {
        if (props.modelAlias === relatedView.modelAlias && props.viewAlias === relatedView.viewAlias) {
            isExist = true;
            newOptions = relatedView.options;
            break;
        }
    }
    if (!isExist) newOptions = options;
    
    return newOptions;
}

export const generateEmbeddedViewXml = (sandbox) => async (section={ id: "__tab__", params: {}, columns: [] }, data, relatedViews=[]) => {
    let xml = "";
    // generate section header xml
    xml = genRawXmlByTemplate(SectionXmlTemplate, {
        name: section.params.name || "",
        background_color: section.params.background_color
            ? `${rgbHex(
                section.params.background_color.replace("rgba", "")
            ).substring(0, 6)}`
            : `FFFFFF`,
        text_color: section.params.text_color
            ? `${rgbHex(section.params.text_color.replace("rgba", "")).substring(
                0,
                6
            )}`
            : `000000`,
        align: section.params.align ? `${section.params.align}` : `left`
    });

    // generate embedded view section body xml
    try {
        const parent = { type: 'form', alias: data.form.attributes.alias, id: data.form.id, name: data.form.name };
        const { nhRecord } = data;
        const { model } = data.req;
        const type = 'embedded_view';
        const embeddedViewOptions = section.params?.embedded_view
        const paramsProps = { options: embeddedViewOptions, type, parent, model, record: nhRecord};
        const props = {
          context: type,
          modelAlias: embeddedViewOptions.model?.alias,
          viewAlias: embeddedViewOptions.view?.alias,
          params: getParams(paramsProps),
        };
        props.params = { ...props.params, humanize: true };
        let options = await getOptions(props.params);
        options = swapClientParams(props, options, relatedViews);
        const view = embeddedViewOptions.view;
        let evxml = "", placeholderParams = {}, placeholderID, placeholderName="", placeholderCounter=1;
        switch (true) {
            case (["grid"].includes(view.type)):
                evxml = await sandbox.vm.p.utils.getViewRawXML(props.modelAlias, props.viewAlias, options);
                if (!isValidXml(evxml)) evxml = "";
                xml += evxml;
                break;
            case (["map","topology", "chart"].includes(view.type)):
                placeholderID = `${view.type}Image${placeholderCounter}`;
                placeholderName = `{%${placeholderID}}`;
                placeholderCounter++;
                placeholderParams = {
                    placeholderID,
                    placeholderName,
                    options: {
                        modelAlias: props.modelAlias,
                        viewAlias: props.viewAlias,
                        options
                    }
                };
                xml += genRawXmlByTemplate(ImagePlaceholderTemplate, {
                    placeholderName
                });
                imageStyleEmbeddedViewParams.push(placeholderParams);
                break;
        }

    } catch (error) {
        logger.error(error)
    }
    return xml;
}

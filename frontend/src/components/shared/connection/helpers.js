export const elementType = {
  ROOT: "root",
  MID: "mid",
  END: "end"
}

export const elementPostionType = {
  LEFT: "left",
  RIGHT: "right"
}

export const linkType = {
  DEFAULT_COLOR: "#E1E1E1",
  DOTTED: "dotted",
  DASHED: "dashed",
  DOTDASH: "dotdash",
  LONGDASH: "longdash",
  TWODASH: "twodash",
}

export const linkDashStyle = {
  SOLID: "0",
  DOTTED: "1",
  DASHED: "2 2",
  DOTDASH: "2 2 1 2",
  LONGDASH: "3 3",
  TWODASH: "2 1 2 2",
}

export const initInstance = {
  ENDPOINTFILL: "#567567",
  ANCHOR: "Left",
}

export const anchorPoint = {
  LEFT: [0.5, 0.5, 1, 0],
  RIGHT: [0.5, 0.5, -1, 0]
}

export const commonCore = {
  isSource: true,
  isTarget: true,
  connector: ["Straight", { stub: 30 }],
  endpoint: "Dot",
  paintStyle: { fill: "transparent", outlineStroke: "transparent" },
  detachable: false,
  connectorHoverStyle: { strokeWidth: 1 },
};

export const sortIndexRoot = (rootElement) => {
  rootElement.left.sort((a, b) => {
    if (a.index == undefined) {
      return b.index - 1;
    } else if (b.index == undefined) {
      return 1 - a.index;
    } else {
      return b.index - a.index;
    }
  })
  return rootElement;
}

export const splitRoot = (conData) => {
  let rootElement = { left: [], right: [] };
  conData.graph.forEach((data) => {
    if (data.collapsed == "true" || data.collapsed == true) {
    } 
    else if (data.type == elementType.ROOT) {
      if (data.positionType == elementPostionType.RIGHT) {
        rootElement.right.push(data)
      } 
      else {
        rootElement.left.push(data)
      }
    }
  })
  return rootElement;
}

export const getEndElement = (rootElement, conData) => {
  let endElement = {};
  endElement.right = [];
  endElement.left = [];
  rootElement.forEach((rootData) => {
    let midElement = [];
    conData.graph.forEach((element) => {
      if (element.parent == rootData.id && element.type == elementType.MID) {
        midElement.push(element);
      }
    });
    conData.graph.forEach((element) => {
      if (element.parent == rootData.id && element.type == elementType.END) {
        if (rootData.positionType == elementPostionType.RIGHT) {
          endElement.right.push(element);
        } else {
          endElement.left.push(element);
        }
      }
    });
    midElement.forEach((midData) => {
      conData.graph.forEach((element) => {
        if (midData.id == element.parent) {
          if (rootData.positionType == elementPostionType.RIGHT) {
            endElement.right.push(element);
          } else if (rootData.positionType == elementPostionType.LEFT) {
            endElement.left.push(element);
          }
        }
      });
    });
  });
  return endElement;
}

export const getLinksData = (linksData) => {
  let fromLinks = [];
  let toLinks = [];
  linksData.forEach(data => {
    fromLinks.push(data.from);
    toLinks.push(data.to);
  });
  return { fromLinks, toLinks }
}

export const getHiddenData = (conData) => {
  let hiddenRootElement = [];
  let hiddenMidElement = [];
  let hiddenEndElement = [];
  conData.graph.forEach((data) => {
    if (data.type == elementType.ROOT && (data.collapsed == true || data.collapsed == "true")) {
      hiddenRootElement.push(data.id);
    }
  })

  conData.graph.forEach((data) => {
    if (hiddenRootElement.includes(data.parent) && data.type == "mid") {
      hiddenMidElement.push(data.id);
    }
    else if (hiddenRootElement.includes(data.parent) && data.type == "end") {
      hiddenEndElement.push(data.id); 
    }
    else if (data.type == elementType.MID && (data.collapsed == true || data.collapsed == "true")) {
      hiddenMidElement.push(data.id);
    }

  })
  conData.graph.forEach((data) => {
    if (hiddenMidElement.includes(data.parent) && !hiddenEndElement.includes(data.id)) {
      hiddenEndElement.push(data.id);
    }
    else if (data.type == elementType.END && (data.collapsed == true || data.collapsed == "true") && !hiddenEndElement.includes(data.id)) {
      hiddenEndElement.push(data.id);
    }
  })
  return hiddenEndElement;
}

export const getParentData = (conData) => {
  let hiddenRootElement = [];
  let hiddenMidElement = [];
  let hiddenEndElement = [];
  let tem_parent = [];
  let parentElement = [];
  conData.graph.forEach((data) => {
    if (data.type == elementType.ROOT && (data.collapsed == true || data.collapsed == "true")) {
      hiddenRootElement.push(data.id);
    }
  })
  conData.graph.forEach(data => {
    if (hiddenRootElement.includes(data.parent) && data.type == "mid") {
      hiddenMidElement.push(data.id);
    }
    else if (hiddenRootElement.includes(data.parent) && data.type == "end") {
      hiddenEndElement.push(data.id); 
    }
    else if (data.type == elementType.MID && (data.collapsed == true || data.collapsed == "true")) {
      hiddenMidElement.push(data.id);
    }
  })
  conData.graph.forEach((data) => {
    if (hiddenMidElement.includes(data.parent)) {
      hiddenEndElement.push(data.id);
    }
    else if (data.type == elementType.END && (data.collapsed == true || data.collapsed == "true")) {
      hiddenEndElement.push(data.id);
    }
  })
  // return hiddenEndElement;
  hiddenEndElement.forEach((data) => {
    conData.graph.forEach((data1) => {
      if (data1.id == data) {
        tem_parent.push(data1.parent);
      }
    })
  })
   tem_parent.forEach((data1) => {
    conData.graph.forEach((data) => {
      if (data1 == data.id && data.type == 'root') {
        parentElement.push(data.name);
      }
      else if (data.id == data1 && data.type == 'mid') {
        conData.graph.forEach((data2) => {
          if (data2.id == data.parent)
            parentElement.push(data2.name);
        })
      }
    })
  })
  return parentElement;
}

export const getParentDataColor = (conData) => {
  let hiddenRootElement = [];
  let hiddenMidElement = [];
  let hiddenEndElement = [];
  let tem_parent = [];
  let parentElement = [];
  conData.graph.forEach((data) => {
    if (data.type == elementType.ROOT && (data.collapsed == true || data.collapsed == "true")) {
      hiddenRootElement.push(data.id);
    }
  })
  conData.graph.forEach(data => {
    if (hiddenRootElement.includes(data.parent) && data.type == "mid") {
      hiddenMidElement.push(data.id);
    }
    else if (hiddenRootElement.includes(data.parent) && data.type == "end") {
      hiddenEndElement.push(data.color); 
    }
    else if (data.type == elementType.MID && (data.collapsed == true || data.collapsed == "true")) {
      hiddenMidElement.push(data.id);
    }
  })
  conData.graph.forEach((data) => {
    if (hiddenMidElement.includes(data.parent)) {
      hiddenEndElement.push(data.color);
    }
    else if (data.type == elementType.END && (data.collapsed == true || data.collapsed == "true")) {
      hiddenEndElement.push(data.color);
    }
  })
  return hiddenEndElement; 
}

export const getElementForDrawing = (conData, id) => {
  let rootElement;
  const midElement = [];
  const endElement = [];
  const midId = [];
  let direction = "ltr";

  conData.graph.forEach((data) => {
    if (data.type == elementType.ROOT && data.id == id) {
      rootElement = data;
      if (data.positionType == elementPostionType.RIGHT) {
        direction = "rtl";
      }
    }
    if (id == data.parent) {
      if (data.collapsed == "true" || data.collapsed == true) {
      }
      else if (data.type == elementType.MID) {
        midElement.push(data);
        midId.push(data.id);
      }
      else if (data.type == elementType.END) {
        endElement.push(data);
      }
    }
    if (data.collapsed == "true" || data.collapsed == true) {
    } else if (data.type == elementType.END && midId.includes(data.parent)) {
      endElement.push(data);
    }
  });
  return { rootElement, midElement, endElement, direction }
}

export const setEndColor = (id, color, disabled) => {
  var el = document.getElementById(id);
  if (!disabled) {
    el.style.boxShadow = `${color}33 0px 0px 0px 4px`;
  }
};

export const clearEndColor = (id) => {
  var el = document.getElementById(id);
  el.style.boxShadow = "none";
};

export const drawLink = (instance, conData, links, endpoint, fieldId) => {
  let conns = [];
  links.forEach((link) => {
    let color = linkType.DEFAULT_COLOR;
    let dashstyle = linkDashStyle.SOLID;
    switch (link.lineType) {
      case linkType.DOTTED:
        dashstyle = linkDashStyle.DOTTED;
        break;
      case linkType.DASHED:
        dashstyle = linkDashStyle.DASHED;
        break;
      case linkType.DOTDASH:
        dashstyle = linkDashStyle.DOTDASH;
        break;
      case linkType.LONGDASH:
        dashstyle = linkDashStyle.LONGDASH;
        break;
      case linkType.TWODASH:
        dashstyle = linkDashStyle.TWODASH;
        break;
      default:
        break;
    }

    const conn = instance.connect({
      source: endpoint[`${link.from}-${fieldId}`],
      target: endpoint[`${link.to}-${fieldId}`],
    });

    conData.graph.forEach((element) => {
      if (element.id == link.from && element.color != undefined) {
        color = element.color;
      }
    });
    try {
      conn.setPaintStyle({
        dashstyle: dashstyle,
        outlineStroke: color,
        strokeWidth: 1
      })
    } catch (error) {
    }

    // try {
    //   conn.setHoverPaintStyle({
    //     dashstyle: "0",
    //     outlineStroke: color,
    //     strokeWidth: 1
    //   })
    // } catch (error) {
    // }
    if (conn !== undefined && conn !== null) {
      conns.push(conn);
    }
  });
  return conns;
}

export const addEndpointElement = (hiddenData, links, instance, endElement, endpoint, fieldId, anchorPoint, disabled) => {
  endElement?.forEach((item) => {
    try {
      let hidden;
      links.forEach(link => {
        if (link.from == item.id || link.to == item.id) {
          hidden = hiddenData.includes(link.from) || hiddenData.includes(link.to)
        }
      });
      endpoint[`${item.id}-${fieldId}`] = instance.addEndpoint(`${item.id}-${fieldId}`, { connectorStyle: { outlineStroke: item.color == undefined ? linkType.DEFAULT_COLOR : item.color, strokeWidth: 1, endpoint: ["Blank"] }, anchor: anchorPoint, enabled: !disabled && !hidden }, commonCore)
    } catch (error) {
    }
  });
  return endpoint;
}

export const confirmEndConnected = (links, elementInfo, fieldId) => {
  let elementId = elementInfo.elementId.replace(`-${fieldId}`, "")
  let includeFlag = links.some(link => link.from == elementId || link.to == elementId);
  return includeFlag;
}

export const alertConnectedEvent = (disabled) => {
  if (!disabled) {
    const connectedEnds = document.getElementsByClassName("jtk-endpoint-connected");
    for (let i = 0; i < connectedEnds.length; i++) {
      connectedEnds[i].addEventListener('mousedown', () => {
        window.alert(i18n.t('item_is_connected', { defaultValue: 'Item is connected. Please remove the connection first.' }))
      })
    }
  }
}
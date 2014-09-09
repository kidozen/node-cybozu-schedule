var util = require('util');
var cybozuUsername = 'test';
var cybozuPassword = 'test';
var path = require('path');
var soapTemplate = require('fs').readFileSync(path.join(__dirname, './soap.template'), 'utf8');

module.exports.prepareRequestXml = function (method, ns, username, password, params) {
    ns = ns || 'http://wsdl.cybozu.co.jp/base/2008';
    username = username || 'test';
    password = password || 'test';

    // timestamp
    var time = new Date(new Date().getTime() - 1 * 60 * 1000);
    var created = time.toISOString().substr(0, 19) + 'Z';
    time = new Date(time.getTime() + 120 * 1000);
    var expires = time.toISOString().substr(0, 19) + 'Z';

    // request
    method = xmlEscape(method);
    var requestBody = "<" + method + ' xmlns="' + ns + '">' +
                            makeParametersXml("parameters", params) +
                        '</' + method + '>';
    var requestXml = soapTemplate
        .replace("{{created}}", created)
        .replace("{{expires}}", expires)
        .replace("{{method}}", method)
        .replace("{{username}}", xmlEscape(username))
        .replace("{{password}}", xmlEscape(password))
        .replace("{{body}}", requestBody);

    return requestXml;
};

module.exports.jprettify = function jprettify(data, parent) {

    if (Array.isArray(data)) {
        //if only one item, with only a $, assume it's parents info.
        if (data.length === 1 && Object.keys(data[0]).length === 1 && data[0]['$']) {
            //parent's info. return object instead of array.
            return data[0]['$'];
        } else {
            //pretify each item.
            var list = []
            for (var i = 0; i <= data.length - 1; i++) {
                list.push(jprettify(data[i], data));
            }
            return list;
        }
    }
    if (typeof data === 'object') {
        if (data['$']) {
            Object.keys(data['$']).forEach(function (i) {
                if (i === 'xmlns') return;
                data[i] = data['$'][i];
            });
            delete data['$'];
        }
        Object.keys(data).forEach(function (i) {
            data[i] = jprettify(data[i], data);
        });
    }
    return data;
};

module.exports.jpath = function jpath(data, path) {
    var parts = path.split('/');
    var temp = data;
    for (var i = 0; i <= parts.length - 1; i++) {
        var propertyName = parts[i];
        if (propertyName === '0' || ~~propertyName > 0) {
            //array index, convert to int.
            propertyName = ~~propertyName;
        }
        if (temp[propertyName] !== null && temp[propertyName] !== undefined)
            temp = temp[propertyName];
        else {
            return undefined;
        }
    }
    return temp;
};

function xmlEscape (text) {
    return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function htmlEscape (text) {
    return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function xmlAttributeEscape (text) {
    return htmlEscape(text).replace(/\r/g, "&#xD;").replace(/\n/g, "&#xA;");
}

function isObj (obj) {
    return typeof obj === "object" && obj !== null;
}

function makeParametersXml (name, child) {
        if (!child || !isObj(child)) return "<" + name + " />";

        var xml = "<" + name;
        var attributesEnded = false;
        if (name == "parameters") {
            xml += ' xmlns=""';
        }
        for (var key in child) {
            var value = child[key];
            if (value == null) {
                // do noting

            } else if (util.isArray(value)) {
                if (!attributesEnded) {
                    attributesEnded = true;
                    xml += ">";
                }
                for (var i = 0; i < value.length; i++) {
                    if (!isObj(value[i])) continue;
                    xml += makeParametersXml(key, value[i]);
                }
            } else if (isObj(value)) {
                if (!attributesEnded) {
                    attributesEnded = true;
                    xml += ">";
                }
                xml += makeParametersXml(key, value);
            } else if (key == "innerValue") {
                // inner value
                if (!attributesEnded) {
                    attributesEnded = true;
                    xml += ">";
                }
                xml += htmlEscape(value);
                break;

            } else if (!attributesEnded) {
                // attribute
                var type = typeof value;
                if (type == "string") {
                    if (value.indexOf("\n") >= 0) {
                        xml += " " + key + '="' + xmlAttributeEscape(value) + '"';
                    } else {
                        xml += " " + key + '="' + htmlEscape(value) + '"';
                    }
                } else if (type == "number" || type == "boolean") {
                    xml += " " + key + '="' + value + '"';
                }

            } else {
                // attributes are ended
            }
        }
        if (!attributesEnded) xml += ">";
        xml += "</" + name + ">";
        return xml;
    }
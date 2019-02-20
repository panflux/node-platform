/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

module.exports = {
    nameRegex: /^[a-z][a-z0-9\-_]*[a-z0-9]$/,
    classRegex: /^[a-z][a-z0-9\-_]+[a-z0-9]\.[a-z][a-z0-9\-_]+[a-z0-9]$/,
    methodRegex: /^[a-z][a-z0-9]+$/i,

    // Ref https://github.com/semver/semver/issues/232, npm package semver-regex had weird flags
    semverRegex: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/,

    scalarTypeRegex: /^(\w+)(!?)$/,
};

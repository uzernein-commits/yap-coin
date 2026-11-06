import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (isRelative(specifier) && !hasKnownExtension(specifier)) {
    const candidate = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(fileURLToPath(candidate))) {
      return nextResolve(`${specifier}.ts`, context);
    }
  }

  return nextResolve(specifier, context);
}

function isRelative(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}

function hasKnownExtension(specifier) {
  return /\.(?:[cm]?[jt]s|json|node)$/.test(specifier);
}

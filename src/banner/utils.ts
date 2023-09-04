import type { TFile } from "obsidian";
import { plug } from "src/main";

export const clamp = (min: number, value: number, max: number) => {
  if (value > max) return max;
  if (value < min) return min;
  return value;
};

const parseInternalLink = (src: string, file: TFile): string | null => {
  const isInternalLink = /^\[\[.+\]\]/.test(src);
  if (!isInternalLink) return null;

  const link = src.slice(2, -2);
  const target = plug.app.metadataCache.getFirstLinkpathDest(link, file.path);
  return target ? plug.app.vault.getResourcePath(target) : link;
}

export const fetchImage = async (src: string|undefined, file: TFile): Promise<string|null> => {
  // Just return the bad link to get the error
  if (!src) return (src ?? null);

  // Check if it's an internal link and use that if it is
  const internalLink = parseInternalLink(src, file);
  if (internalLink) return internalLink;

  try {
    const resp = await fetch(src);
    const blob = await resp.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error)
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

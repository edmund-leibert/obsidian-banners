import { Notice, Platform } from 'obsidian';
import type { TFile } from 'obsidian';
import Banner from './Banner.svelte';

export type Embedded = 'internal' | 'popover' | false;

export interface BannerProps extends BannerData {
  file: TFile;
  viewType: 'editing' | 'reading';
  embed?: Embedded;
}

interface LeafBannerEntry {
  banner: Banner;
  container: HTMLElement;
}

const WRAPPER_CLASS = 'obsidian-banner-wrapper';
const IN_INTERNAL_EMBED_CLASS = 'in-internal-embed';
const IN_POPOVER_CLASS = 'in-popover';
const MOBILE_CLASS = 'mobile';

export const leafBannerMap: Record<string, LeafBannerEntry> = {};

export const createBanner = (bannerProps: BannerProps, container: HTMLElement, id: string) => {
  const cls = [WRAPPER_CLASS];
  if (Platform.isMobile) cls.push(MOBILE_CLASS);
  if (bannerProps.embed === 'internal') cls.push(IN_INTERNAL_EMBED_CLASS);
  else if (bannerProps.embed === 'popover') cls.push(IN_POPOVER_CLASS);

  const wrapper = createDiv({ cls });
  const banner = new Banner({
    target: wrapper,
    props: bannerProps
  });

  try {
    container.prepend(wrapper);
    leafBannerMap[id] = { banner, container };
  } catch (error) {
    new Notice('Unable to add a banner to the leaflet!');
    console.error(error);
  }
};

export const updateBanner = (bannerProps: Partial<BannerProps>, id: string) => {
  try {
    leafBannerMap[id].banner.$set(bannerProps);
  } catch (error) {
    new Notice(`Failed to update banner at leaf ${id}!`);
    console.error(error);
  }
};

export const destroyBanner = (id: string) => {
  if (!leafBannerMap[id]) return;
  const { banner, container } = leafBannerMap[id];
  banner.$destroy();
  container.querySelector(`.${WRAPPER_CLASS}`)?.remove();
  delete leafBannerMap[id];
};

export const hasBanner = (id: string): boolean => !!leafBannerMap[id];

export const unloadAllBanners = () => {
  for (const id of Object.keys(leafBannerMap)) {
    destroyBanner(id);
  }
};

// Helper on whether a banner element should be displayed or not
export const shouldDisplayBanner = (bannerData: BannerData): boolean => {
  const { source, icon, header } = bannerData;
  return !!(source || icon || header);
};

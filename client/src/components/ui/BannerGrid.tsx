import React from 'react';
import styles from './BannerGrid.module.css';
import { Banner } from '../../utils/types';

interface BannerGridProps {
    bannerPortfolio: Banner[];
    onBannerSelect: (banner: Banner) => void;
    previewBgColor: string;
    infoTextColor?: string;
}

const BannerGrid: React.FC<BannerGridProps> = ({
    bannerPortfolio,
    onBannerSelect,
    previewBgColor,
}) => {

    return (
        <div className={styles.trait_preview_grid}>
            {bannerPortfolio.map((banner: Banner, index: number) => {
                return (
                    <div
                        key={index}
                        className={styles.trait_preview_container}
                    >
                        <img
                            className={styles.trait_preview_img}
                            src={banner.dataURL}
                            onClick={() => onBannerSelect(banner)}
                            style={{ backgroundColor: previewBgColor }}
                        />
                        <p>#{banner.tokenId}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default BannerGrid;
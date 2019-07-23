import { InvocationSettings } from "../settings/invocation_settings";
import { RDSStorage, _rds_storage_type_str_to_type } from "../models/rds_storage";
import { RDSStorageSettingsValidator } from "../settings/rds_storage_settings_validator";
import { RDSStoragePrice } from "../rds_storage_price";
import { PriceDuration } from "../price_converter";
import { _initContext } from "../context";

function _rds_storage(settings: InvocationSettings, volumeType: RDSStorage, volumeSize: string|number) {
    if (!volumeSize) {
        throw `Must set a RDS volume size`
    }

    let volumeSizeNum = parseFloat(volumeSize.toString())
    if (!volumeSizeNum) {
        throw `Unable to parse RDS volume size from ${volumeSize}`
    }

    let [ret, msg] = new RDSStorageSettingsValidator(settings).validate()
    if (!ret) {
        throw msg
    }

    return new RDSStoragePrice(settings, volumeType, volumeSizeNum).get(PriceDuration.Hourly)
}

function _rds_storage_settings(settingsRange: Array<Array<string>>, volumeType: RDSStorage, volumeSize: string|number, region?: string) {
    let overrides = {}
    if (region) {
        overrides['region'] = region
    }

    let settings = InvocationSettings.loadFromRange(settingsRange, overrides)

    return _rds_storage(settings, volumeType, volumeSize)
}

function _rds_storage_full(volumeType: RDSStorage, volumeSize: string|number, region: string) {
    let settings = InvocationSettings.loadFromMap({'region': region})

    return _rds_storage(settings, volumeType, volumeSize)
}

/**
 * Returns the price of RDS storage for the given volume type.
 * 
 * @param settingsRange Two-column range of default EC2 instance settings
 * @param volumeType type of RDS storage volume (aurora, gp2, piops, or magnetic)
 * @param volumeSize Size of the volume in Gigabytes
 * @param region Override the region from the settings range (optional)
 * @returns price
 * @customfunction
 */
export function RDS_STORAGE_GB(settingsRange: Array<Array<string>>, volumeType: string, volumeSize: string|number, region?: string): number;

/**
 * Returns the price of RDS storage for the given volume type.
 * 
 * @param volumeType type of RDS storage volume (aurora, gp2, piops, or magnetic)
 * @param volumeSize Size of the volume in Gigabytes
 * @param region 
 * @returns price
 * @customfunction
 */
export function RDS_STORAGE_GB(volumeType: string, volumeSize: string | number, region: string): number

export function RDS_STORAGE_GB(settingsOrType, typeOrSize, sizeOrRegion, region?: string): number {
    _initContext()

    if (!settingsOrType) {
        throw `Must specify a parameter`
    }

    if (typeof settingsOrType === "string") {
        let storageType = _rds_storage_type_str_to_type(settingsOrType)
        if (storageType == null) {
            throw `Invalid storage type ${settingsOrType}`
        }

        return _rds_storage_full(storageType, typeOrSize, sizeOrRegion)
    } else {
        if (!typeOrSize) {
            throw `Must specify RDS volume type`
        }

        let storageType = _rds_storage_type_str_to_type(typeOrSize.toString())
        if (storageType == null) {
            throw `Invalid storage type ${typeOrSize}`
        }

        return _rds_storage_settings(settingsOrType, storageType, sizeOrRegion, region)
    }
}


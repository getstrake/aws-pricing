import { EBSPrice, EBSStorageType } from "../ebs_price";
import { PriceDuration } from "../price_converter";
import { InvocationSettings } from "../settings/invocation_settings";
import { EBSSettingsValidator } from "../settings/ebs_settings_validator";
import { _initContext } from "../context";

function _ec2_ebs(settings: InvocationSettings, storageType: EBSStorageType, volumeType: string, volumeUnits: string | number) {

    if (!volumeType && storageType !== EBSStorageType.Snapshot) {
        throw `Must specify EBS volume type`
    }

    if (!volumeUnits) {
        throw `Must specify EBS volume units (iops or size)`
    }

    let [ret, msg] = new EBSSettingsValidator(settings).validate()
    if (!ret) {
        throw msg
    }

    if (volumeType) {
        volumeType = volumeType.toLowerCase()
    }

    let ebsPrices = new EBSPrice(settings, storageType, volumeType, volumeUnits.toString())

    return ebsPrices.get(PriceDuration.Hourly)
}

export function EC2_EBS_GB(settingsRange: Array<Array<string>>, type: string, size: string | number, region?: string): number
export function EC2_EBS_GB(type: string, size: string | number, region: string): number
export function EC2_EBS_GB(settingsOrType, typeOrSize, sizeOrRegion, region?: string): number {
    _initContext()

    let settings: InvocationSettings = null
    let volumeType: string = null
    let volumeSize: string = null

    if (!settingsOrType) {
        throw `Must specify parameter`
    }

    if (typeof settingsOrType === "string") {
        volumeType = settingsOrType
        volumeSize = typeOrSize

        if (!sizeOrRegion) {
            throw `Must specify region`
        }
        
        settings = InvocationSettings.loadFromMap({'region': sizeOrRegion})
    } else {
        let overrides = {}

        if (region) {
            overrides['region'] = region
        }

        volumeType = typeOrSize
        volumeSize = sizeOrRegion

        settings = InvocationSettings.loadFromRange(settingsOrType, overrides)
    }

    return _ec2_ebs(settings, EBSStorageType.Storage, volumeType, volumeSize)
}

/**
 * Returns the monthly cost for the amount of provisioned EBS IO1 IOPS
 * 
 * @param settingsRange Two-column range of default EC2 instance settings
 * @param iops Number of provisioned IOPS
 * @param region Override region setting of settings (optional)
 * @returns monthly price
 * @customfunction
 */
export function EC2_EBS_IO1_IOPS(settingsRange: Array<Array<string>>, iops: string | number, region?: string): number;

/**
* Returns the monthly cost for the amount of provisioned EBS IO1 IOPS
* 
* @param iops Number of provisioned IOPS
* @param region
* @returns monthly price
* @customfunction
*/
export function EC2_EBS_IO1_IOPS(iops: string | number, region: string): number;

export function EC2_EBS_IO1_IOPS(settingsOrIops, iopsOrRegion, region?) {
    _initContext()

    let volumeIops: string = null
    let settings: InvocationSettings = null

    if (!settingsOrIops) {
        throw `Must specify parameter`
    }

    if (typeof settingsOrIops === "string" || typeof settingsOrIops === "number") {
        volumeIops = settingsOrIops.toString()

        settings = InvocationSettings.loadFromMap({'region': iopsOrRegion})
    } else {
        let overrides = {}

        if (region) {
            overrides['region'] = region
        }

        volumeIops = iopsOrRegion.toString()

        settings = InvocationSettings.loadFromRange(settingsOrIops, overrides)
    }

    return _ec2_ebs(settings, EBSStorageType.Iops, 'io1', volumeIops)
}

/**
 * Returns the monthly cost for the amount of EBS snapshot data stored in Gigabytes
 * 
 * @param settingsRange Two-column range of default EC2 instance settings
 * @param size the number of Gigabytes stored
 * @param region Override region setting of settings (optional)
 * @returns monthly price
 * @customfunction
 */
export function EC2_EBS_SNAPSHOT_GB(settingsRange: Array<Array<string>>, size: string | number, region?: string): number;

/**
* Returns the monthly cost for the amount of EBS snapshot data stored in Gigabytes
* 
* @param size the number of Gigabytes stored
* @param region
* @returns monthly price
* @customfunction
*/
export function EC2_EBS_SNAPSHOT_GB(size: string | number, region: string): number;

export function EC2_EBS_SNAPSHOT_GB(settingsOrSize, sizeOrRegion, region?) {
    _initContext()

    let volumeSize: string = null
    let settings: InvocationSettings = null

    if (!settingsOrSize) {
        throw `Must specify parameter`
    }

    if (typeof settingsOrSize === "string" || typeof settingsOrSize === "number") {
        volumeSize = settingsOrSize.toString()

        settings = InvocationSettings.loadFromMap({'region': sizeOrRegion})
    } else {
        let overrides = {}

        if (region) {
            overrides['region'] = region
        }

        volumeSize = sizeOrRegion.toString()

        settings = InvocationSettings.loadFromRange(settingsOrSize, overrides)
    }

    return _ec2_ebs(settings, EBSStorageType.Snapshot, null, volumeSize)
}

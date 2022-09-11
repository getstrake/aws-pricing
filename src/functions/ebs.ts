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
        throw `Must specify EBS volume units (iops, size or throughput)`
    }

    let [ret, msg] = new EBSSettingsValidator(settings).validate()
    if (!ret) {
        throw msg
    }

    if (volumeType) {
        volumeType = volumeType.toString().toLowerCase()
    }

    let ebsPrices = new EBSPrice(settings, storageType, volumeType, volumeUnits.toString())

    return ebsPrices.get(PriceDuration.Hourly)
}

function _ec2_ebs_iops(volumeType: string, settingsOrIops, iopsOrRegion, region?) {
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

    return _ec2_ebs(settings, EBSStorageType.Iops, volumeType, volumeIops)
}

function _ec2_ebs_throughput(volumeType: string, settingsOrThroughput, throughputOrRegion, region?) {
    let throughput: string = null
    let settings: InvocationSettings = null

    if (!settingsOrThroughput) {
        throw `Must specify parameter`
    }

    if (typeof settingsOrThroughput === "string" || typeof settingsOrThroughput === "number") {
        throughput = settingsOrThroughput.toString()

        settings = InvocationSettings.loadFromMap({'region': throughputOrRegion})
    } else {
        let overrides = {}

        if (region) {
            overrides['region'] = region
        }

        throughput = throughputOrRegion.toString()

        settings = InvocationSettings.loadFromRange(settingsOrThroughput, overrides)
    }

    return _ec2_ebs(settings, EBSStorageType.Throughput, volumeType, throughput)
}

export function EC2_EBS_GB(settingsRange: Array<Array<string>>, volumeType: string, volumeSize: string | number, region?: string): number;
export function EC2_EBS_GB(volumeType: string, volumeSize: string | number, region: string): number

/**
 * Returns the hourly cost for the amount of provisioned EBS storage. Invoke as either:
 * (settingsRange, volumeType, volumeSize[, region]) or (volumeType, volumeSize, region).
 *
 * @param {A2:B7 or "gp2"} settingsOrType Settings range or volume type
 * @param {"gp2" or 4000} typeOrSize Volume type or volume size (in GB)
 * @param {4000 or "us-east-2"} sizeOrRegion Volume size (in GB) or region
 * @param {"us-east-2"} region AWS region (optional)
 * @returns price
 * @customfunction
 */
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

export function EC2_EBS_IO1_IOPS(settingsRange: Array<Array<string>>, iops: string | number, region?: string): number;
export function EC2_EBS_IO1_IOPS(iops: string | number, region: string): number;

/**
 * Returns the hourly cost for the amount of provisioned EBS IO1 IOPS. Invoke as either:
 * (settingsRange, iops[, region]) or (iops, region).
 *
 * @param {A2:B7 or 2500} settingsOrIops Settings range or number of iops
 * @param {2500 or "us-east-2"} iopsOrRegion Number of iops or region
 * @param {"us-east-2"} region AWS region (optional)
 * @returns price
 * @customfunction
 */
export function EC2_EBS_IO1_IOPS(settingsOrIops, iopsOrRegion, region?) {
    _initContext()

    return _ec2_ebs_iops('io1', settingsOrIops, iopsOrRegion, region)
}

export function EC2_EBS_IO2_IOPS(settingsRange: Array<Array<string>>, iops: string | number, region?: string): number;
export function EC2_EBS_IO2_IOPS(iops: string | number, region: string): number;

/**
 * Returns the hourly cost for the amount of provisioned EBS IO2 IOPS. Invoke as either:
 * (settingsRange, iops[, region]) or (iops, region).
 *
 * @param {A2:B7 or 2500} settingsOrIops Settings range or number of iops
 * @param {2500 or "us-east-2"} iopsOrRegion Number of iops or region
 * @param {"us-east-2"} region AWS region (optional)
 * @returns price
 * @customfunction
 */
export function EC2_EBS_IO2_IOPS(settingsOrIops, iopsOrRegion, region?) {
    _initContext()

    return _ec2_ebs_iops('io2', settingsOrIops, iopsOrRegion, region)
}

export function EC2_EBS_GP3_IOPS(settingsRange: Array<Array<string>>, iops: string | number, region?: string): number;
export function EC2_EBS_GP3_IOPS(iops: string | number, region: string): number;

/**
 * Returns the hourly cost for the amount of provisioned EBS GP3 IOPS. Invoke as either:
 * (settingsRange, iops[, region]) or (iops, region).
 *
 * @param {A2:B7 or 2500} settingsOrIops Settings range or number of iops
 * @param {2500 or "us-east-2"} iopsOrRegion Number of iops or region
 * @param {"us-east-2"} region AWS region (optional)
 * @returns price
 * @customfunction
 */
export function EC2_EBS_GP3_IOPS(settingsOrIops, iopsOrRegion, region?) {
    _initContext()

    return _ec2_ebs_iops('gp3', settingsOrIops, iopsOrRegion, region)
}

export function EC2_EBS_GP3_THROUGHPUT(settingsRange: Array<Array<string>>, throughput: string | number, region?: string): number;
export function EC2_EBS_GP3_THROUGHPUT(throughput: string | number, region: string): number;

/**
 * Returns the hourly cost for the amount of provisioned EBS GP3 throughput. Invoke as either:
 * (settingsRange, throughput[, region]) or (throughput, region).
 *
 * @param {A2:B7 or 225} settingsOrThroughput Settings range or MB/s of throughput
 * @param {225 or "us-east-2"} throughputOrRegion MB/s of throughput or region
 * @param {"us-east-2"} region AWS region (optional)
 * @returns price
 * @customfunction
 */
export function EC2_EBS_GP3_THROUGHPUT(settingsOrThroughput, throughputOrRegion, region?) {
    _initContext()

    return _ec2_ebs_throughput('gp3', settingsOrThroughput, throughputOrRegion, region)
}

export function EC2_EBS_SNAPSHOT_GB(settingsRange: Array<Array<string>>, size: string | number, region?: string): number;
export function EC2_EBS_SNAPSHOT_GB(size: string | number, region: string): number;

/**
 * Returns the hourly cost for the amount of EBS snapshot data stored in Gigabytes. Invoke as either:
 * (settingsRange, size[, region]) or (size, region).
 *
 * @param {A2:B7 or 3000} settingsOrSize Settings range or size in Gigabytes
 * @param {3000 or "us-east-2"} sizeOrRegion Size in Gigabytes or region
 * @param {"us-east-2"} region AWS region (optional)
 * @returns price
 * @customfunction
 */
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

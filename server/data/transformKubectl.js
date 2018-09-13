const nicsKubectl = require('./kubectl/networkendpoints.json')

const service = 'gt'
const datacenter = 'dal12'
const pod = 'dal12.g4'
const environment = 'PROD'

const vmType = 'CCI'
const hwType = 'BAREMETAL'

const kbStrToGb = kiStr => parseInt(parseFloat(kiStr.slice(0, -2)) / (1024 * 1024))
const mbToGb = mi => parseInt(parseFloat(mi)) / 1024

const compact = arr => arr.filter(Boolean)
const deepFlatten = arr => [].concat(...arr.map(v => (Array.isArray(v) ? deepFlatten(v) : v)))
const sum = arr => arr.reduce((acc, val) => acc + val, 0)

const uniqueElements = arr => [...new Set(arr)]
const forOwn = (obj, fn) => Object.keys(obj).forEach(key => fn(obj[key], key, obj))

function buildNicIpHash(nicsKubectl) {
  const nicIpHash = {}
  nicsKubectl.forEach(nic => {
    const vnicName = nic.metadata.labels.vnic_name
    nicIpHash[vnicName] = nicIpHash[vnicName] || []
    nicIpHash[vnicName].push(nic.status.ipv4)
  })
  forOwn(nicIpHash, (val, key, obj) => obj[key] = deepFlatten(compact(uniqueElements(val))))
  return nicIpHash
}
const nicIpHash = buildNicIpHash(nicsKubectl.items)
const ipsForNics = nics => deepFlatten(nics.map(n => nicIpHash[n]))

const internalIPAddrs = statusAddrs => statusAddrs.filter(a => a.type === 'InternalIP').map(a => a.address)
const combinedDiskSizeGb = disks => sum(compact(disks.map(d => d.volumeSpec && d.volumeSpec.SizeGiB)))

const hwFromKubectl = nodeJson => ({
  name: nodeJson.spec.externalID,
  type: hwType,
  service,
  pod,
  datacenter,
  environment,
  processor_cores: nodeJson.status.capacity.cpu,
  memory: kbStrToGb(nodeJson.status.capacity.memory),
  storage_space: nodeJson.status.capacity['ephemeral-storage'].slice(0, -2),
  os: nodeJson.status.nodeInfo.osImage,
  addresses: internalIPAddrs(nodeJson.status.addresses),
  created: nodeJson.metadata.creationTimestamp
})

const vmFromKubectl = vmJson => ({
  name: vmJson.metadata.name,
  type: vmType,
  service,
  pod,
  datacenter,
  environment,
  processor_cores: vmJson.spec.hardwareSettings.cpuInformation.vcpus,
  memory: mbToGb(vmJson.spec.hardwareSettings.memorySizeMiB),
  storage_space: combinedDiskSizeGb(vmJson.spec.disks),
  //os: UNAVAILABLE?
  addresses: ipsForNics(vmJson.status.nics || []),
  created: vmJson.metadata.creationTimestamp
})

const transformKubectlHws = hwKubectlItems => hwKubectlItems.map(hw => hwFromKubectl(hw))
const transformKubectlVms = vmKubectlItems => vmKubectlItems.map(vm => vmFromKubectl(vm))

module.exports = { transformKubectlHws, transformKubectlVms }

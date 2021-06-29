#!/usr/bin/env node
// 判断：是否是开发环境
if (!__dirname.includes('node_modules')) {
  try {
    // only available as dev dependency
    // 如果是开发环境，尝试引入source-map-support???并install
    require('source-map-support').install()
  } catch (e) {}
}

// 全局变量声明：vite开始执行时间
global.__vite_start_time = Date.now()

// check debug mode first before requiring the CLI.
// 变量声明：debugIndex = -d/--debug 在传入的环境变量Array的索引，不用indexOf的原因是要判断两个
// 变量声明：filterIndex = -f/--filter 在传入的环境变量Array的索引
const debugIndex = process.argv.findIndex((arg) => /^(?:-d|--debug)$/.test(arg))
const filterIndex = process.argv.findIndex((arg) =>
  /^(?:-f|--filter)$/.test(arg)
)
// 变量声明：profileIndex = -f/--profile 在传入的环境变量Array的索引
const profileIndex = process.argv.indexOf('--profile')

// 当 debugIndex 存在，则???
if (debugIndex > 0) {
  let value = process.argv[debugIndex + 1]
  if (!value || value.startsWith('-')) {
    value = 'vite:*'
  } else {
    // support debugging multiple flags with comma-separated list
    value = value
      .split(',')
      .map((v) => `vite:${v}`)
      .join(',')
  }
  process.env.DEBUG = value
  // 且当 filterIndex 存在，则???
  if (filterIndex > 0) {
    const filter = process.argv[filterIndex + 1]
    if (filter && !filter.startsWith('-')) {
      process.env.VITE_DEBUG_FILTER = filter
    }
  }
}

function start() {
  require('../dist/node/cli')
}

if (profileIndex > 0) {
  process.argv.splice(profileIndex, 1)
  const next = process.argv[profileIndex]
  if (next && !next.startsWith('-')) {
    process.argv.splice(profileIndex, 1)
  }
  const inspector = require('inspector')
  const session = (global.__vite_profile_session = new inspector.Session())
  session.connect()
  session.post('Profiler.enable', () => {
    session.post('Profiler.start', start)
  })
} else {
  // 装载node-cli
  start()
}

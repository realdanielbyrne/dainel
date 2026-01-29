// swift-tools-version: 6.2
// Package manifest for the Dainel macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "Dainel",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "DainelIPC", targets: ["DainelIPC"]),
        .library(name: "DainelDiscovery", targets: ["DainelDiscovery"]),
        .executable(name: "Dainel", targets: ["Dainel"]),
        .executable(name: "dainel-mac", targets: ["DainelMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/DainelKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "DainelIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "DainelDiscovery",
            dependencies: [
                .product(name: "DainelKit", package: "DainelKit"),
            ],
            path: "Sources/DainelDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "Dainel",
            dependencies: [
                "DainelIPC",
                "DainelDiscovery",
                .product(name: "DainelKit", package: "DainelKit"),
                .product(name: "DainelChatUI", package: "DainelKit"),
                .product(name: "DainelProtocol", package: "DainelKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/Dainel.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "DainelMacCLI",
            dependencies: [
                "DainelDiscovery",
                .product(name: "DainelKit", package: "DainelKit"),
                .product(name: "DainelProtocol", package: "DainelKit"),
            ],
            path: "Sources/DainelMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "DainelIPCTests",
            dependencies: [
                "DainelIPC",
                "Dainel",
                "DainelDiscovery",
                .product(name: "DainelProtocol", package: "DainelKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])

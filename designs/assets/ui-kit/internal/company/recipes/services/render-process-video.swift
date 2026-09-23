// Rebuild the three authored diagram frames; no downloaded imagery or personal data.
// Run: swift render-process-video.swift <temporary-output-directory>
import AppKit
let output = CommandLine.arguments[1]
let labels = ["1. 정보 확인", "2. 항목 선택", "3. 참여 완료"]
for active in 0..<3 {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 640, pixelsHigh: 360, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
    NSColor.white.setFill(); NSRect(x: 0, y: 0, width: 640, height: 360).fill()
    for i in 0..<3 {
        NSColor(srgbRed: 243/255, green: 244/255, blue: 245/255, alpha: 1).setFill()
        NSRect(x: 40 + i*200, y: 140, width: 160, height: 100).fill()
        if i == active {
            NSColor(srgbRed: 21/255, green: 84/255, blue: 160/255, alpha: 1).setFill()
            NSRect(x: 40 + i*200, y: 140, width: 160, height: 5).fill()
        }
        (labels[i] as NSString).draw(at: NSPoint(x: 55 + i*200, y: 178), withAttributes: [.font: NSFont.systemFont(ofSize: 20, weight: .medium), .foregroundColor: NSColor(srgbRed: 48/255, green: 54/255, blue: 61/255, alpha: 1)])
    }
    ("모의 절차 안내 · 실제 신청이 아닙니다" as NSString).draw(at: NSPoint(x: 135, y: 65), withAttributes: [.font: NSFont.systemFont(ofSize: 20), .foregroundColor: NSColor.darkGray])
    NSGraphicsContext.restoreGraphicsState()
    try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: output + "/process-frame-\(active).png"))
}

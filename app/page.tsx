"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Trash2, FileText, Settings, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Comprehensive list of functional HTML attributes to preserve
const FUNCTIONAL_ATTRIBUTES = new Set([
  // Core attributes
  "id",
  "title",
  "lang",
  "dir",
  "hidden",

  // Link attributes
  "href",
  "target",
  "rel",
  "download",
  "hreflang",
  "type",

  // Form attributes
  "action",
  "method",
  "name",
  "value",
  "placeholder",
  "required",
  "disabled",
  "readonly",
  "checked",
  "selected",
  "multiple",
  "size",
  "maxlength",
  "minlength",
  "min",
  "max",
  "step",
  "pattern",
  "autocomplete",
  "autofocus",
  "form",
  "formaction",
  "formmethod",
  "formtarget",
  "for",

  // Media attributes
  "src",
  "alt",
  "width",
  "height",
  "controls",
  "autoplay",
  "loop",
  "muted",
  "poster",
  "preload",
  "crossorigin",

  // Table attributes
  "colspan",
  "rowspan",
  "headers",
  "scope",

  // Interactive attributes
  "tabindex",
  "accesskey",
  "contenteditable",
  "draggable",
  "dropzone",

  // ARIA attributes (accessibility)
  "role",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-hidden",
  "aria-expanded",
  "aria-selected",
  "aria-checked",
  "aria-disabled",
  "aria-required",
  "aria-invalid",
  "aria-live",
  "aria-atomic",
  "aria-relevant",
  "aria-busy",
  "aria-controls",
  "aria-owns",
  "aria-flowto",
  "aria-activedescendant",

  // Meta attributes
  "charset",
  "content",
  "http-equiv",
  "property",
  "itemprop",
  "itemscope",
  "itemtype",

  // Script/style functional attributes
  "defer",
  "async",
  "integrity",
  "nonce",

  // Other semantic attributes
  "datetime",
  "cite",
  "open",
  "reversed",
  "start",
  "span",
])

// Styling attributes to remove
const STYLING_ATTRIBUTES = new Set([
  "class",
  "style",
  "bgcolor",
  "color",
  "face",
  "size",
  "align",
  "valign",
  "background",
  "border",
  "cellpadding",
  "cellspacing",
  "frame",
  "rules",
  "summary",
  "bordercolor",
  "bordercolordark",
  "bordercolorlight",
])

interface AttributeStats {
  preserved: string[]
  styling: string[]
  unknown: string[]
  dataAttributes: string[]
  eventHandlers: string[]
}

export default function HTMLAttributeStripper() {
  const [inputHtml, setInputHtml] = useState("")
  const [outputHtml, setOutputHtml] = useState("")
  const [attributeStats, setAttributeStats] = useState<AttributeStats>({
    preserved: [],
    styling: [],
    unknown: [],
    dataAttributes: [],
    eventHandlers: [],
  })
  const [beautifyOutput, setBeautifyOutput] = useState(true)
  const [normalizeText, setNormalizeText] = useState(true)
  const [removeEmptyTags, setRemoveEmptyTags] = useState(true)
  const [removeBrTags, setRemoveBrTags] = useState(false)
  const [fixPunctuation, setFixPunctuation] = useState(true)
  const { toast } = useToast()

  const categorizeAttribute = (attrName: string): keyof AttributeStats => {
    const lowerAttrName = attrName.toLowerCase()

    if (FUNCTIONAL_ATTRIBUTES.has(lowerAttrName) || lowerAttrName.startsWith("aria-")) {
      return "preserved"
    }
    if (STYLING_ATTRIBUTES.has(lowerAttrName)) {
      return "styling"
    }
    if (lowerAttrName.startsWith("data-")) {
      return "dataAttributes"
    }
    if (lowerAttrName.startsWith("on")) {
      return "eventHandlers"
    }
    return "unknown"
  }

  const beautifyHtml = (html: string, indent = "  "): string => {
    if (!html.trim()) return ""

    try {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html

      const formatElement = (element: Element, depth = 0): string => {
        const tagName = element.tagName.toLowerCase()
        const indentation = indent.repeat(depth)
        const nextIndentation = indent.repeat(depth + 1)

        // Self-closing tags
        const selfClosingTags = new Set([
          "area",
          "base",
          "br",
          "col",
          "embed",
          "hr",
          "img",
          "input",
          "link",
          "meta",
          "param",
          "source",
          "track",
          "wbr",
        ])

        if (selfClosingTags.has(tagName)) {
          const attributes = Array.from(element.attributes)
            .map((attr) => ` ${attr.name}="${attr.value}"`)
            .join("")
          return `${indentation}<${tagName}${attributes}>`
        }

        // Regular tags
        const attributes = Array.from(element.attributes)
          .map((attr) => ` ${attr.name}="${attr.value}"`)
          .join("")

        const openTag = `${indentation}<${tagName}${attributes}>`
        const closeTag = `${indentation}</${tagName}>`

        // Handle content
        const children = Array.from(element.childNodes)
        if (children.length === 0) {
          return `${openTag}</${tagName}>`
        }

        // Check if element contains only text
        const hasOnlyText = children.every((child) => child.nodeType === Node.TEXT_NODE)
        const textContent = element.textContent?.trim() || ""

        if (hasOnlyText && textContent.length < 50 && !textContent.includes("\n")) {
          return `${openTag}${textContent}</${tagName}>`
        }

        // Format children
        const formattedChildren: string[] = []

        children.forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            formattedChildren.push(formatElement(child as Element, depth + 1))
          } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim()
            if (text) {
              formattedChildren.push(`${nextIndentation}${text}`)
            }
          }
        })

        if (formattedChildren.length === 0) {
          return `${openTag}</${tagName}>`
        }

        return [openTag, ...formattedChildren, closeTag].join("\n")
      }

      const formattedElements = Array.from(tempDiv.children)
        .map((child) => formatElement(child))
        .join("\n\n")

      return formattedElements
    } catch (error) {
      console.error("Beautification error:", error)
      return html // Return original if beautification fails
    }
  }

  const normalizeTextContent = (html: string): string => {
    if (!html.trim()) return ""

    try {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html

      const normalizeElement = (element: Element) => {
        // Process all child nodes
        const childNodes = Array.from(element.childNodes)

        childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            // Normalize text content: collapse multiple whitespace/newlines into single spaces
            const normalizedText = node.textContent
              ?.replace(/\s+/g, " ") // Replace multiple whitespace chars with single space
              ?.trim() // Remove leading/trailing whitespace

            if (normalizedText) {
              node.textContent = normalizedText
            } else {
              // Remove empty text nodes
              node.remove()
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Recursively process child elements
            normalizeElement(node as Element)
          }
        })
      }

      // Process all elements
      Array.from(tempDiv.children).forEach((child) => {
        normalizeElement(child)
      })

      return tempDiv.innerHTML
    } catch (error) {
      console.error("Text normalization error:", error)
      return html // Return original if normalization fails
    }
  }

  const fixPunctuationSpacing = (html: string): string => {
    if (!html.trim()) return ""

    try {
      // Fix punctuation spacing using regex patterns that handle HTML tags
      let fixedHtml = html

      // Fix spaces between closing HTML tags and punctuation
      // This handles cases like "</bdt> ," -> "</bdt>,"
      fixedHtml = fixedHtml.replace(/(<\/[^>]+>)\s+([,.;:!?])/g, "$1$2")

      // Fix spaces between any content and punctuation (including after tags)
      // This handles cases like "word ," -> "word,"
      fixedHtml = fixedHtml.replace(/\s+([,.;:!?])/g, "$1")

      // Fix multiple spaces after punctuation to single space
      // This handles cases like "word.  next" -> "word. next"
      fixedHtml = fixedHtml.replace(/([,.;:!?])\s+/g, "$1 ")

      // Special handling for periods at end of sentences (ensure single space after)
      fixedHtml = fixedHtml.replace(/\.\s*([A-Z])/g, ". $1")

      // Fix spaces around parentheses and brackets
      // Remove space before closing: "word )" -> "word)"
      fixedHtml = fixedHtml.replace(/\s+([)\]}])/g, "$1")
      // Remove space after opening: "( word" -> "(word"
      fixedHtml = fixedHtml.replace(/([([{])\s+/g, "$1")

      // Fix spaces between closing tags and closing punctuation
      fixedHtml = fixedHtml.replace(/(<\/[^>]+>)\s+([)\]}])/g, "$1$2")

      // Fix quotes spacing
      // Remove space before closing quotes: "word "" -> "word""
      fixedHtml = fixedHtml.replace(/\s+(["'])/g, "$1")
      // Remove space after opening quotes: "" word" -> ""word"
      fixedHtml = fixedHtml.replace(/(["'])\s+/g, "$1")

      // Fix apostrophes (don't add space before apostrophes in contractions)
      fixedHtml = fixedHtml.replace(/\s+'/g, "'")

      // Additional fix: remove spaces between any character/tag and punctuation
      // This is a more aggressive approach to catch edge cases
      fixedHtml = fixedHtml.replace(/(\w|>)\s+([,.;:!?])/g, "$1$2")

      return fixedHtml
    } catch (error) {
      console.error("Punctuation fixing error:", error)
      return html // Return original if fixing fails
    }
  }

  const removeEmptyTagsFunc = (html: string): string => {
    if (!html.trim()) return ""

    try {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html

      const removeEmptyElements = (element: Element): boolean => {
        // Process children first (bottom-up approach)
        const children = Array.from(element.children)
        children.forEach((child) => {
          if (removeEmptyElements(child)) {
            child.remove()
          }
        })

        // Check if element is empty after processing children
        const hasContent = element.textContent?.trim() || ""
        const hasNonEmptyChildren = element.children.length > 0
        const hasAttributes = element.attributes.length > 0

        // Keep elements that have:
        // 1. Text content
        // 2. Non-empty children
        // 3. Functional attributes (like img with src, input with value, etc.)
        // 4. Self-closing tags that are inherently functional
        const tagName = element.tagName.toLowerCase()
        const functionalSelfClosingTags = new Set([
          "img",
          "input",
          "br",
          "hr",
          "area",
          "base",
          "col",
          "embed",
          "link",
          "meta",
          "param",
          "source",
          "track",
          "wbr",
        ])

        const isFunctionalSelfClosing = functionalSelfClosingTags.has(tagName)
        const hasFunctionalAttributes =
          hasAttributes &&
          Array.from(element.attributes).some((attr) => {
            const attrName = attr.name.toLowerCase()
            return FUNCTIONAL_ATTRIBUTES.has(attrName) || attrName.startsWith("aria-")
          })

        // Remove if element is truly empty (no content, no children, no functional attributes)
        const shouldRemove = !hasContent && !hasNonEmptyChildren && !hasFunctionalAttributes && !isFunctionalSelfClosing

        return shouldRemove
      }

      // Process all top-level elements
      Array.from(tempDiv.children).forEach((child) => {
        if (removeEmptyElements(child)) {
          child.remove()
        }
      })

      return tempDiv.innerHTML
    } catch (error) {
      console.error("Empty tag removal error:", error)
      return html // Return original if removal fails
    }
  }

  const removeBrTagsFunc = (html: string): string => {
    if (!html.trim()) return ""

    try {
      // Use regex to remove both <br> and <br /> variations
      // This handles: <br>, <br/>, <br />, <BR>, <BR/>, <BR />
      const brRegex = /<br\s*\/?>/gi
      return html.replace(brRegex, "")
    } catch (error) {
      console.error("BR tag removal error:", error)
      return html // Return original if removal fails
    }
  }

  const stripAttributes = (htmlString: string) => {
    if (!htmlString.trim()) {
      setOutputHtml("")
      setAttributeStats({
        preserved: [],
        styling: [],
        unknown: [],
        dataAttributes: [],
        eventHandlers: [],
      })
      return
    }

    try {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = htmlString

      const stats: AttributeStats = {
        preserved: [],
        styling: [],
        unknown: [],
        dataAttributes: [],
        eventHandlers: [],
      }

      const processElement = (element: Element) => {
        const attributesToRemove: string[] = []

        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i]
          const attrName = attr.name
          const category = categorizeAttribute(attrName)

          if (category === "preserved") {
            if (!stats.preserved.includes(attrName)) {
              stats.preserved.push(attrName)
            }
          } else {
            attributesToRemove.push(attrName)
            if (!stats[category].includes(attrName)) {
              stats[category].push(attrName)
            }
          }
        }

        attributesToRemove.forEach((attrName) => {
          element.removeAttribute(attrName)
        })

        Array.from(element.children).forEach((child) => {
          processElement(child)
        })
      }

      Array.from(tempDiv.children).forEach((child) => {
        processElement(child)
      })

      // Sort all arrays
      Object.keys(stats).forEach((key) => {
        stats[key as keyof AttributeStats].sort()
      })

      let cleanedHtml = tempDiv.innerHTML

      // Normalize text content to remove excessive whitespace
      if (normalizeText) {
        cleanedHtml = normalizeTextContent(cleanedHtml)
      }

      // Fix punctuation spacing
      if (fixPunctuation) {
        cleanedHtml = fixPunctuationSpacing(cleanedHtml)
      }

      // Remove br tags if enabled
      if (removeBrTags) {
        cleanedHtml = removeBrTagsFunc(cleanedHtml)
      }

      // Remove empty tags
      if (removeEmptyTags) {
        cleanedHtml = removeEmptyTagsFunc(cleanedHtml)
      }

      // Apply beautification if enabled
      if (beautifyOutput) {
        cleanedHtml = beautifyHtml(cleanedHtml)
      }

      setOutputHtml(cleanedHtml)
      setAttributeStats(stats)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse HTML. Please check your input.",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "HTML has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const clearAll = () => {
    setInputHtml("")
    setOutputHtml("")
    setAttributeStats({
      preserved: [],
      styling: [],
      unknown: [],
      dataAttributes: [],
      eventHandlers: [],
    })
  }

  const loadExample = () => {
    const exampleHtml = `<div class="container" style="background: red;" data-id="123" custom-attr="value">
  <h1 class="title" style="color: blue;" data-track="header" id="main-title">Hello World</h1>
  <p class="text-lg" style="margin: 10px;" data-section="content" lang="en">
    This is a <a href="https://example.com" class="link" target="_blank" rel="noopener" onclick="track()">sample link</a> with some text.<br />
    This line has a break.<br>
    Another line with break.
  </p>
  <span>
    by phone at
    <bdt>+43 6643279880</bdt>
    ,
  </span>
  <p>Contact us at <bdt>email@example.com</bdt> , or call us at ( 555 ) 123-4567 .</p>
  <p>We're available Monday - Friday , 9:00 AM - 5:00 PM .</p>
  <p>This sentence has bad spacing . And this one too .</p>
  <p>Multiple spaces after period .  Next sentence starts here .</p>
  <p>Phone: <bdt> +1234567890 </bdt> , Email: <span> test@example.com </span> .</p>
  <bdt>
    <span>
      <span>
        <span>
          <span>
            <span>
              <span>
                <bdt></bdt>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </bdt>
  <form action="/submit" method="post" class="form">
    <div class="form-group">
      <label for="username" class="label">Username:</label><br/>
      <input type="text" name="username" id="username" placeholder="Enter username" required class="input" data-validate="true" />
    </div>
    <div class="empty-wrapper">
      <div class="another-empty">
        <span></span>
      </div>
    </div>
    <button type="submit" id="submit-btn" class="btn btn-primary" onclick="submit()" data-action="submit" disabled>Submit</button>
  </form>
  <img src="/image.jpg" alt="Sample image" width="300" height="200" class="responsive" style="border: 1px solid #ccc;" />
  <div role="button" tabindex="0" aria-label="Interactive element" class="interactive" custom-role="special">Accessible content</div>
</div>`
    setInputHtml(exampleHtml)
  }

  const getTotalRemoved = () => {
    return (
      attributeStats.styling.length +
      attributeStats.unknown.length +
      attributeStats.dataAttributes.length +
      attributeStats.eventHandlers.length
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Smart HTML Attribute Stripper</h1>
          <p className="text-gray-600">
            Intelligently removes styling and unknown attributes while preserving functional ones
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={loadExample} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Load Example
          </Button>
          <Button onClick={clearAll} variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Input HTML</CardTitle>
              <CardDescription>Paste your HTML content here to intelligently strip unwanted attributes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col flex-grow">
              <Textarea
                placeholder="<div class='example' style='color: red;' data-id='123'>Content</div>"
                value={inputHtml}
                onChange={(e) => setInputHtml(e.target.value)}
                className="font-mono text-sm flex-grow"
              />
              <Button onClick={() => stripAttributes(inputHtml)} className="w-full" disabled={!inputHtml.trim()}>
                <Settings className="w-4 h-4 mr-2" />
                Strip Attributes
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle>Cleaned HTML</CardTitle>
              <CardDescription>HTML with only functional attributes preserved</CardDescription>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch id="beautify-mode" checked={beautifyOutput} onCheckedChange={setBeautifyOutput} />
                  <Label htmlFor="beautify-mode" className="text-sm">
                    Beautify HTML
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="normalize-text" checked={normalizeText} onCheckedChange={setNormalizeText} />
                  <Label htmlFor="normalize-text" className="text-sm">
                    Normalize Text
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="remove-empty" checked={removeEmptyTags} onCheckedChange={setRemoveEmptyTags} />
                  <Label htmlFor="remove-empty" className="text-sm">
                    Remove Empty
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="remove-br" checked={removeBrTags} onCheckedChange={setRemoveBrTags} />
                  <Label htmlFor="remove-br" className="text-sm">
                    Remove BR
                  </Label>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Switch id="fix-punctuation" checked={fixPunctuation} onCheckedChange={setFixPunctuation} />
                  <Label htmlFor="fix-punctuation" className="text-sm">
                    Fix Punctuation Spacing
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={outputHtml}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-gray-50"
                placeholder="Cleaned HTML will appear here..."
              />
              <Button
                onClick={() => copyToClipboard(outputHtml)}
                variant="outline"
                className="w-full"
                disabled={!outputHtml}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Attribute Analysis */}
        {(attributeStats.preserved.length > 0 || getTotalRemoved() > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Attribute Analysis</CardTitle>
              <CardDescription>
                Preserved: {attributeStats.preserved.length} • Removed: {getTotalRemoved()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preserved" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="preserved" className="text-xs">
                    Preserved ({attributeStats.preserved.length})
                  </TabsTrigger>
                  <TabsTrigger value="styling" className="text-xs">
                    Styling ({attributeStats.styling.length})
                  </TabsTrigger>
                  <TabsTrigger value="data" className="text-xs">
                    Data ({attributeStats.dataAttributes.length})
                  </TabsTrigger>
                  <TabsTrigger value="events" className="text-xs">
                    Events ({attributeStats.eventHandlers.length})
                  </TabsTrigger>
                  <TabsTrigger value="unknown" className="text-xs">
                    Unknown ({attributeStats.unknown.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preserved" className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Preserved
                    </Badge>
                    <span className="text-sm text-gray-600">Functional attributes kept for proper HTML behavior</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attributeStats.preserved.map((attr) => (
                      <Badge key={attr} variant="outline" className="border-green-200">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="styling" className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      Removed
                    </Badge>
                    <span className="text-sm text-gray-600">Styling attributes that affect visual appearance</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attributeStats.styling.map((attr) => (
                      <Badge key={attr} variant="outline" className="border-red-200">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="data" className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                      Removed
                    </Badge>
                    <span className="text-sm text-gray-600">Data attributes used for JavaScript/tracking</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attributeStats.dataAttributes.map((attr) => (
                      <Badge key={attr} variant="outline" className="border-orange-200">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="events" className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive" className="bg-purple-100 text-purple-800">
                      Removed
                    </Badge>
                    <span className="text-sm text-gray-600">Event handler attributes (onclick, onload, etc.)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attributeStats.eventHandlers.map((attr) => (
                      <Badge key={attr} variant="outline" className="border-purple-200">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="unknown" className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive" className="bg-gray-100 text-gray-800">
                      Removed
                    </Badge>
                    <span className="text-sm text-gray-600">Non-standard or custom attributes</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attributeStats.unknown.map((attr) => (
                      <Badge key={attr} variant="outline" className="border-gray-200">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Smart Attribute Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-green-700 mb-3">✅ Preserved (Functional):</h4>
                <div className="space-y-2 text-gray-600">
                  <div>
                    <strong>Navigation:</strong> href, target, rel, download
                  </div>
                  <div>
                    <strong>Forms:</strong> action, method, name, value, required, disabled
                  </div>
                  <div>
                    <strong>Media:</strong> src, alt, width, height, controls
                  </div>
                  <div>
                    <strong>Accessibility:</strong> id, role, aria-*, tabindex, for
                  </div>
                  <div>
                    <strong>Semantic:</strong> lang, title, datetime, cite
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-3">❌ Removed Categories:</h4>
                <div className="space-y-2 text-gray-600">
                  <div>
                    <strong>Styling:</strong> class, style, bgcolor, align, border
                  </div>
                  <div>
                    <strong>Data attributes:</strong> data-*, custom tracking
                  </div>
                  <div>
                    <strong>Event handlers:</strong> onclick, onload, onchange
                  </div>
                  <div>
                    <strong>Unknown:</strong> Non-standard custom attributes
                  </div>
                  <div>
                    <strong>Legacy:</strong> Deprecated HTML attributes
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2">🎨 HTML Beautification:</h4>
              <div className="text-sm text-blue-600 space-y-1">
                <div>• Proper indentation for nested elements</div>
                <div>• Line breaks for better readability</div>
                <div>• Consistent formatting structure</div>
                <div>• Toggle on/off as needed</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">📝 Text Normalization:</h4>
              <div className="text-sm text-green-600 space-y-1">
                <div>• Collapses multiple spaces/newlines into single spaces</div>
                <div>• Removes excessive whitespace that doesn't render</div>
                <div>• Cleans up copy-pasted content with formatting artifacts</div>
                <div>• Makes text more readable in code editors</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-2">🗑️ Empty Tag Removal:</h4>
              <div className="text-sm text-purple-600 space-y-1">
                <div>• Removes nested empty elements with no content</div>
                <div>• Preserves functional elements (img, input, etc.)</div>
                <div>• Keeps elements with functional attributes</div>
                <div>• Cleans up generated HTML with empty wrappers</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-700 mb-2">🚫 BR Tag Removal:</h4>
              <div className="text-sm text-orange-600 space-y-1">
                <div>• Removes all &lt;br&gt; and &lt;br /&gt; line break tags</div>
                <div>• Processes before empty tag removal</div>
                <div>• Useful for cleaning up formatted text content</div>
                <div>• Handles all variations (br, br/, br /)</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-cyan-50 rounded-lg">
              <h4 className="font-semibold text-cyan-700 mb-2">✨ Punctuation Spacing:</h4>
              <div className="text-sm text-cyan-600 space-y-1">
                <div>• Removes spaces before punctuation (word . → word.)</div>
                <div>• Removes spaces before commas (word , → word,)</div>
                <div>• Normalizes spaces after punctuation marks</div>
                <div>• Fixes parentheses and bracket spacing</div>
                <div>• Corrects quote mark positioning</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

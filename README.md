# Smart HTML Attribute Stripper

This tool intelligently processes HTML content to remove unwanted attributes while preserving essential functional ones. It helps clean up messy HTML, remove inline styling, and strip tracking or non-standard attributes.

## Core Features

*   **Intelligent Attribute Filtering:**
    *   **Preserves:** Core functional attributes necessary for HTML structure, navigation (`href`, `target`), forms (`action`, `name`, `value`), media (`src`, `alt`), accessibility (`id`, `role`, `aria-*`), and semantic meaning (`lang`, `title`).
    *   **Removes:**
        *   Styling attributes (`class`, `style`, `bgcolor`, `align`).
        *   Data attributes (`data-*`).
        *   Event handlers (`onclick`, `onload`).
        *   Unknown or custom non-standard attributes.
        *   Legacy/deprecated attributes.
*   **Attribute Analysis:** Provides a detailed breakdown of which attributes were preserved and which were removed, categorized by type (Styling, Data, Events, Unknown).

## Processing Options

The stripping process can be customized with the following toggles:

*   **Beautify HTML:** Formats the cleaned HTML output with proper indentation and line breaks for improved readability.
*   **Normalize Text:** Collapses multiple whitespace characters (spaces, newlines) within text content into single spaces and trims leading/trailing whitespace from text nodes. This helps clean up text formatting inconsistencies.
*   **Remove Empty Tags:** Deletes HTML elements that are truly empty (i.e., have no text content, no non-empty child elements, and no preserved functional attributes). Self-closing tags with functional purposes (e.g., `<img>` with `src`, `<input>` with `type`) are preserved.
*   **Remove BR Tags:** Strips all `<br>` and `<br />` tags from the HTML. This is processed before empty tag removal.
*   **Fix Punctuation Spacing:** Automatically corrects common punctuation spacing issues, such as removing spaces before commas and periods, ensuring correct spacing after punctuation, and fixing spacing around parentheses, brackets, and quotation marks.

## User Interface

*   **Input & Output:** Clear text areas for pasting input HTML and viewing the cleaned output.
*   **Controls:**
    *   `Strip Attributes`: Initiates the cleaning process.
    *   `Copy to Clipboard`: Copies the cleaned HTML to the clipboard.
    *   `Load Example`: Populates the input field with sample HTML to demonstrate functionality.
    *   `Clear All`: Clears both input and output fields, and resets attribute statistics.
*   **Informative Sections:** Provides detailed explanations of what types of attributes are preserved/removed and how each processing option works.

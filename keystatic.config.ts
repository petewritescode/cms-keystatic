import { config, fields, collection } from "@keystatic/core";

const richTextOptions = {
  bold: true,
  italic: true,
  strikethrough: false,
  code: false,
  heading: false,
  blockquote: false,
  orderedList: false,
  unorderedList: false,
  table: false,
  link: true,
  image: false,
  divider: false,
  codeBlock: false,
} as const;

const richTextBlock = {
  label: "Rich text",
  schema: fields.object({
    text: fields.markdoc.inline({
      label: "Text",
      description: "Bold, italic, and links only.",
      options: richTextOptions,
    }),
  }),
};

const imageBlock = {
  label: "Image",
  schema: fields.object({
    asset: fields.text({
      label: "Asset",
      description:
        "A path relative to the story folder, or an absolute URL. This is stored as text. Keystatic does not upload the file.",
      validation: { isRequired: true },
    }),
    alt: fields.text({
      label: "Alt text",
      validation: { isRequired: true },
    }),
  }),
  itemLabel: (props) => props.fields.alt.value,
};

const columnBlocks = {
  richText: richTextBlock,
  image: imageBlock,
};

export default config({
  storage: {
    kind: "github",
    repo: "petewritescode/cms-keystatic",
  },
  collections: {
    stories: collection({
      label: "Stories",
      slugField: "path",
      path: "content/stories/**",
      format: { data: "json" },
      entryLayout: "form",
      schema: {
        path: fields.text({
          label: "Story path",
          description:
            "brand/market/model/year/slug. Example: lr/en_gb/l560/k2675/adas. This becomes the filename and is not written into the JSON.",
          validation: {
            isRequired: true,
            pattern: {
              regex:
                /^[a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_-]+$/,
              message:
                "Use brand/market/model/year/slug, for example lr/en_gb/l560/k2675/adas",
            },
          },
        }),
        blocks: fields.blocks(
          {
            heading: {
              label: "Heading",
              schema: fields.object({
                text: fields.text({
                  label: "Text",
                  validation: { isRequired: true },
                }),
              }),
              itemLabel: (props) => `Heading: ${props.fields.text.value}`,
            },
            richText: richTextBlock,
            image: imageBlock,
            twoColumn: {
              label: "Two columns",
              schema: fields.object({
                start: fields.blocks(columnBlocks, {
                  label: "Start",
                  description: "Rich text and image blocks only.",
                }),
                end: fields.blocks(columnBlocks, {
                  label: "End",
                  description: "Rich text and image blocks only.",
                }),
              }),
            },
          },
          {
            label: "Blocks",
            description:
              "Ordered story blocks. Two-column blocks can contain rich text and images, and cannot contain another two-column block.",
          },
        ),
      },
    }),
  },
});

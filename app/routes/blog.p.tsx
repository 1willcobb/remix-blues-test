import React from "react";
import { ClientOnly } from "remix-utils/client-only";

import {
  MDXEditor,
  headingsPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
} from "~/components/editor.client";


export default function Index() {
  return (
    <ClientOnly fallback={<p>Loading...</p>}>
      {() => (
        <MDXEditor
          markdown="# Hello world"
          className="prose"
          // readOnly={true}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            linkPlugin(),
            quotePlugin(),
            markdownShortcutPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  {" "}
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                </>
              ),
            }),
          ]}
        />
      )}
    </ClientOnly>
  );
}

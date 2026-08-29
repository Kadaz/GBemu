(() => {
    "use strict";

    const ROM_PATH = "roms/";
    const ROM_LIST = "roms/roms.json";

    async function loadROMList() {
        const response = await fetch(
            ROM_LIST + "?v=" + Date.now(),
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error(
                "Cannot load roms.json: HTTP " +
                response.status
            );
        }

        const list = await response.json();

        if (!Array.isArray(list)) {
            throw new Error(
                "roms.json must contain an array"
            );
        }

        return list.filter(
            name =>
                typeof name === "string" &&
                /\.(gb|gbc)$/i.test(name)
        );
    }


    async function loadROM(name) {

        const response = await fetch(
            ROM_PATH +
            name
                .split("/")
                .map(encodeURIComponent)
                .join("/") +
            "?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Cannot load ROM: HTTP " +
                response.status +
                " - " +
                name
            );
        }

        const buffer =
            await response.arrayBuffer();

        /*
         * GBemu already has its own ROM
         * loading system.
         *
         * Find the real file input used
         * by GBemu.
         */
        const input =
            document.getElementById("inputfile");

        if (!input) {
            throw new Error(
                "GBemu ROM input not found"
            );
        }

        const file =
            new File(
                [buffer],
                name,
                {
                    type:
                    "application/octet-stream"
                }
            );

        const transfer =
            new DataTransfer();

        transfer.items.add(file);

        input.files =
            transfer.files;

        input.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles:true
                }
            )
        );
    }


    async function start() {

        try {

            const roms =
                await loadROMList();

            if (!roms.length) {
                throw new Error(
                    "No .gb or .gbc ROMs found"
                );
            }

            /*
             * Wait for GBemu itself to finish
             * initializing.
             */
            setTimeout(
                async () => {

                    try {

                        await loadROM(
                            roms[0]
                        );

                    } catch (e) {

                        console.error(
                            "Auto ROM error:",
                            e
                        );

                    }

                },
                1500
            );

        } catch (e) {

            console.error(
                "Auto loader error:",
                e
            );

        }
    }


    window.addEventListener(
        "load",
        start
    );

})();
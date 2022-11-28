const files = document.querySelector(".files");

const upload = document.querySelector(".upload");
const analysis = document.querySelector(".analysis");
const about_us = document.querySelector(".about_us");

const output = document.querySelector(".output");
const output_logo = document.querySelector(".output_logo");
const output_info = document.querySelector(".output_info");
const download_result_logo = document.querySelector(".download_result_logo");
const link = document.querySelector(".link");

const loader = document.querySelector(".loader_div");

const download_result_elements = document.querySelectorAll(".download_result_element");

const after_loading = document.querySelector(".after_loading");

analysis.hidden = true;
about_us.hidden = true;
loader.hidden = true;
after_loading.style.display = "none";

const getFiles = async () => {
    files.innerHTML = "";

    const res = await fetch("/getFiles");
    const data = await res.json();

    for (let i = 0; i < data.data.length; i++) {
        const div = document.createElement("div");
        div.className = "loaded_file_div";

        const button = document.createElement("button");
        button.textContent = data.data[i];
        button.className = "loaded_file_button";

        div.append(button);
        files.append(div);

        button.onclick = async () => {
            if (after_loading.style.display == "inline") {
                after_loading.style.display = "none";
            }

            if (output.hidden && output_info.hidden && download_result_elements[0].hidden) {
                output.hidden = false;
                output_info.hidden = false;
                
                download_result_elements.forEach(el => {
                    el.hidden = false;
                });
            }

            loader.hidden = false;

            const res = await fetch("/reportFilename", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({data: button.textContent})
            });

            const data = await res.json();

            if (!data.data) {
                after_loading.style.display = "inline";
                output.hidden = true;
                output_info.hidden = true;
                loader.hidden = true;
                
                download_result_elements.forEach(el => {
                    el.hidden = true;
                });

                output_logo.hidden = false;

                output_logo.innerHTML = "Не удалось выровнять и найти общую часть вирусов из-за их непохожести.";
                
                return;
            }

            after_loading.style.display = "inline";

            link.href = "/result.txt";

            loader.hidden = true;

            output_logo.innerHTML = `Найденные совпадения вирусов в папке <i>${button.textContent}</i>, файлах <i>${data.data[2].names[0]}</i> и <i>${data.data[2].names[1]}</i> соответственно:`;
            output_info.innerHTML = `Для получения результата файл <i>${data.data[2].cut_file_name}</i> был обрезан — удалена передняя часть <i>${data.data[2].part}</i>.`

            if (output.children.length) {
                output.innerHTML = "";
            }

            console.log(data);

            data.data[0] = data.data[0].replace(/\s/g, "");

            for (key of data.data[0]) {
                if (key.toLowerCase() == key) {
                    data.data[0] = data.data[0].split(key).join("");
                }
            }

            for (key of data.data[1]) {
                if (key.toLowerCase() == key) {
                    data.data[1] = data.data[1].split(key).join("");
                }
            }

            let less_length = 0;

            const mistakes = [];

            if (data.data[0].length > data.data[1].length) {
                less_length = data.data[1];
            } else {
                less_length = data.data[0];
            }

            for (let i = 0; i < less_length.length; i++) {
                if (data.data[0][i] != data.data[1][i]) {
                    mistakes.push(i);
                }
            }

            console.log(mistakes);

            const color_viruses = (html_element, virus, mistakes) => {
                const virus_div = document.createElement("div");
                virus_div.className = "virus_div";

                for (let i = 0; i < mistakes.length; i++) {
                    const h2_start = document.createElement("h2");
                    const h2_color = document.createElement("h2");

                    h2_color.className = "color_virus";

                    if (!i) {
                        h2_start.textContent = virus.slice(0, mistakes[i]);
                    } else {
                        h2_start.textContent = virus.slice(mistakes[i - 1] + 1, mistakes[i]);
                    }
    
                    h2_color.textContent = virus[mistakes[i]];

                    let spaces = h2_start.textContent.split("");
                    h2_start.textContent = spaces.join(" ");
    
                    virus_div.append(h2_start);
                    virus_div.append(h2_color);

                    html_element.append(virus_div);
                }
            }

            color_viruses(output, data.data[0], mistakes);
            color_viruses(output, data.data[1], mistakes);
        }
    }

    console.log(data.data);
}

const upload_button = document.querySelector(".upload_button");
const analysis_button = document.querySelector(".analysis_button");
const about_us_button = document.querySelector(".about_us_button");

upload_button.onclick = () => {
    upload.hidden = false;
    analysis.hidden = true;
    about_us.hidden = true;
}

analysis_button.onclick = () => {
    upload.hidden = true;
    analysis.hidden = false;
    about_us.hidden = true;

    /* output.hidden = true;
    output_logo.hidden = true;
    output_info.hidden = true;
    
    download_result_elements.forEach(el => {
        el.hidden = true;
    }); */

    after_loading.style.display = "none";

    getFiles();
}

about_us_button.onclick = () => {
    upload.hidden = true;
    analysis.hidden = true;
    about_us.hidden = false;
}
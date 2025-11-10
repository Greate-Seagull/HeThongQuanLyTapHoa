export default function (plop) {
    plop.setGenerator("composition-root", {
        actions: [
            {
                type: "add",
                path: "src/composition-root.ts",
                templateFile: "templates/composition-root.template.hbs",
            }
        ]
    })

    plop.setGenerator("object-driven", {
        description: "this is a skeleton plopfile",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "Name your object: ",
            },
        ],
        actions: [
            // create router
            {
                type: "add",
                path: "src/presentation/routes/{{kebabCase name}}.route.ts",
                templateFile: "templates/router.template.hbs",
            },
            // add router to app
            {
                type: "modify",
                path: "src/app.ts",
                pattern: /(import .*;)(\r?\n)(?=\s*[^import])/m,
                template: '$1$2import {{camelCase name}}Router from "./presentation/routes/{{kebabCase name}}.route";$2'
            },
            {
                type: "modify",
                path: "src/app.ts",
                pattern: /(app\.use\(.*\);)(\r?\n)(?=\s*[^app\.use])/m,
                template: '$1$2app.use("/{{dashCase name}}", {{camelCase name}}Router);$2'
            },
            // create router
            {
                type: "add",
                path: "src/presentation/controllers/{{kebabCase name}}.controller.ts",
                templateFile: "templates/controller.template.hbs",
            },
            // create repo
            {
                type: "add",
                path: "src/infrastructure/repositories/{{kebabCase name}}.repository.ts",
                templateFile: "templates/repository.template.hbs",
            },
            // add repo to composition root
            {
                type: "modify",
                path: "src/composition-root.ts",
                pattern: /(import .*;)(\r?\n)(?=\s*[^import])/m,
                template: '$1$2import { {{titleCase name}}Repository } from "./infrastructure/repositories/{{kebabCase name}}.repository";$2'
            },
            {
                type: "modify",
                path: "src/composition-root.ts",
                pattern: /^[ \t]*\/\/Repositories.*$/m, // matches "//repositories" line even with spaces/tabs
                template: '$&\nexport const {{camelCase name}}Repo = new {{titleCase name}}Repository(prisma);'
            },
            // create read accessor
            {
                type: "add",
                path: "src/infrastructure/read-accessors/{{kebabCase name}}.read-accessor.ts",
                templateFile: "templates/read-accessor.template.hbs",
            },
            // add read accessor to composition root
            {
                type: "modify",
                path: "src/composition-root.ts",
                pattern: /(import .*;)(\r?\n)(?=\s*[^import])/m,
                template: '$1$2import { {{titleCase name}}ReadAccessor } from "./infrastructure/read-accessors/{{kebabCase name}}.read-accessor";$2'
            },
            {
                type: "modify",
                path: "src/composition-root.ts",
                pattern: /^[ \t]*\/\/Read accessors.*$/m, // matches "//repositories" line even with spaces/tabs
                template: '$&\nexport const {{camelCase name}}Read = new {{titleCase name}}ReadAccessor(prisma);'
            },
            // create mapper
            {
                type: "add",
                path: "src/infrastructure/mappers/{{kebabCase name}}.mapper.ts",
                templateFile: "templates/mapper.template.hbs",
            },
            // create domain
            {
                type: "add",
                path: "src/domain/{{kebabCase name}}.ts",
                templateFile: "templates/domain.template.hbs",
            },
        ]
    })

    plop.setGenerator("feature-driven", {
        description: "this is a skeleton plopfile",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "Name your feature: ",
            },
            {
                type: "input",
                name: "apiMethod",
                message: "API method: ",
            },
            {
                type: "input",
                name: "apiURI",
                message: "API URI: ",
            },
            {
                type: "input",
                name: "domain",
                message: "domain: ",
            }
        ],
        actions: [
            // create test
            {
                type: "add",
                path: "tests/{{kebabCase name}}/{{kebabCase name}}.integration.test.ts",
                templateFile: "templates/integration.test.template.hbs",
            },
            // create test data
            {
                type: "add",
                path: "tests/{{kebabCase name}}/{{kebabCase name}}.test-data.ts",
                templateFile: "templates/test-data.template.hbs",
            },
            // create usecase
            {
                type: "add",
                path: "src/application/{{kebabCase name}}.usecase.ts",
                templateFile: "templates/usecase.template.hbs",
            },
            // add usecase to composition root
            {
                type: "modify",
                path: "src/composition-root.ts",
                pattern: /(import .*;)(\r?\n)(?=\s*[^import])/m,
                template: '$1$2import { {{titleCase name}}Usecase } from "./application/{{kebabCase name}}.usecase";$2'
            },
            {
                type: "modify",
                path: "src/composition-root.ts",
                pattern: /^[ \t]*\/\/Usecases.*$/m,
                template: '$&\nexport const {{camelCase name}}Usecase = new {{titleCase name}}Usecase();'
            },
            // add usecase to controller
            {
                type: "modify",
                path: "src/presentation/controllers/{{kebabCase domain}}.controller.ts",
                pattern: /^/m,
                template: 'import { {{camelCase name}}Usecase } from "../../composition-root";\n'
            },
            {
                type: "modify",
                path: "src/presentation/controllers/{{kebabCase domain}}.controller.ts",
                pattern: /^[ \t]*\/\/Handlers.*$/m,
                templateFile: "templates/controller-method.template.hbs"
            },
            // add controller method to router
            {
                type: "modify",
                path: "src/presentation/routes/{{kebabCase domain}}.route.ts",
                pattern: /^/m,
                template: 'import { control{{titleCase name}} } from "../controllers/{{kebabCase domain}}.controller";\n'
            },
            {
                type: "modify",
                path: "src/presentation/routes/{{kebabCase domain}}.route.ts",
                pattern: /^[ \t]*\/\/Handlers.*$/m, // matches "//repositories" line even with spaces/tabs
                template: '$&\nrouter.{{lowerCase apiMethod}}("{{stripDomain apiURI domain}}", control{{titleCase name}});'
            },
        ],
    })

    plop.setHelper("normalCase", (str) => {
        str = str.toLowerCase();
        return str.charAt(0).toUpperCase() + str.slice(1);
    })

    plop.setHelper("kebabCase", (str) => {
        return str
            .trim()                    // remove leading/trailing spaces
            .toLowerCase()             // lowercase everything
            .replace(/\s+/g, "-");    // replace spaces with hyphens
    });

    plop.setHelper("titleCase", (str) => {
        if (!str) return "";
        return str
            .split(/\s+/)                     // split by spaces
            .map(txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()) // capitalize each word
            .join("");                        // join without spaces
    });

    plop.setHelper("snakeCase", (str) => {
        return str
            .replace(/\W+/g, " ")
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase)
            .join("_");
    });

    plop.setHelper("dashCase", (str) => {
        let result = str
            .trim()                               // remove leading/trailing spaces
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // insert dash between camelCase/PascalCase
            .replace(/[_\s]+/g, "-")             // replace spaces or underscores with dash
            .toLowerCase()                        // lowercase everything
            .replace(/[^a-z0-9-]/g, "");         // remove any other special characters

        // Add 's' at the end if it doesn't already end with 's'
        if (!result.endsWith("s")) {
            result += "s";
        }

        return result;
    });

    plop.setHelper("stripDomain", function (uri, domain) {
        if (!uri) return uri;
        if (!domain) return uri;

        uri = String(uri);
        domain = String(domain).trim();

        // If domain is a Handlebars placeholder like "{{domain}}", remove braces for matching
        const domainBare = domain.replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");

        // build a regex that matches:
        //  - optional protocol + host: ^https?://[^/]+
        //  - optional leading slash
        //  - optional "{{domain}}" placeholder or bare domain (escaped)
        //  - optional trailing slash after domain
        const domainRE = `(?:\\{\\{\\s*${escapeRegExp(domainBare)}s?\\s*\\}\\}|${escapeRegExp(domainBare)}s?)`;
        const fullRE = new RegExp(`^(?:https?:\\/\\/[^/]+)?\\/?${domainRE}(?=\\/|$)\\/?`, "i");

        // replace match with single leading slash
        const result = uri.replace(fullRE, "/");

        // make sure we return a path that starts with "/"
        return result.startsWith("/") ? result : `/${result}`;

        function escapeRegExp(str) {
            return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
    });
}
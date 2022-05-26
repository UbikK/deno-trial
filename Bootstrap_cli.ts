const path = Deno.cwd();

const filesToWrite: { path: string; content: string; create?: boolean }[] = [];

const projectName: string = prompt(
    "Project name?",
    path.split("/").pop()
) as string;

Deno.mkdirSync(`${path}/${projectName}`);
Deno.chdir(`${path}/${projectName}`);
const p = Deno.run({
    cmd: [
        "git",
        "clone",
        "-b",
        "feat/cli",
        "git@github.com:TommyTheTribe/bootstrap-node-react.git",
        ".",
    ],
});
await p.status();

p.close();

Deno.removeSync(`${path}/${projectName}/cli`, { recursive: true });
Deno.removeSync(`${path}/${projectName}/bootstrap`);
Deno.removeSync(`${path}/${projectName}/.git`, { recursive: true });
const gitInit = Deno.run({
    cmd: ["git", "init"],
});
await gitInit.status();

gitInit.close();
/**
 * prompts
 */
const terraformProjectName = prompt(
    "Terraform Project Name",
    projectName
) as string;

const serverName = prompt("Server name?", `${projectName}-staging`) as string;
const frontendImage = prompt(
    "Frontend Docker Image name?",
    `${projectName}-frontend`
) as string;
const backendImage = prompt(
    "Backend Docker Image name?",
    `${projectName}-backend`
) as string;

const vaultPass = prompt(
    "Enter a vault password to work with ansible: "
) as string;
await Deno.writeTextFile("./ansible/vault_pass.txt", vaultPass, {
    create: true,
});

const scwToken = prompt("Enter your scaleway Token: ") as string;
const vaultedTokenProcess = Deno.run({
    cmd: [
        "ansible-vault",
        "encrypt_string",
        "--vault-password-file",
        "./ansible/vault_pass.txt",
        `'${scwToken}'`,
        "--name",
        "'scaleway_token'",
    ],
    stdout: "piped",
});

const [_vaultedTokenProcessStatus, vaultedToken] = await Promise.all([
    vaultedTokenProcess.status(),
    vaultedTokenProcess.output(),
]);
vaultedTokenProcess.close();

await Deno.writeTextFile(
    "./ansible/vars/scaleway_token.yml",
    new TextDecoder().decode(vaultedToken),
    {
        create: true,
    }
);

/**
 * Terraform
 */
const terraformServerFile = (
    await Deno.readTextFile("./terraform/server.tf")
).replaceAll("{terraform_project_name}", terraformProjectName);
filesToWrite.push({
    path: `./terraform/server.tf`,
    content: terraformServerFile,
});

// Call terraform and get IP
Deno.chdir("./terraform");
const terraformInit = Deno.run({ cmd: ["terraform", "init"] });
await terraformInit.status();
terraformInit.close();

const terraformPlan = Deno.run({ cmd: ["terraform", "plan"] });
await terraformPlan.status();
terraformPlan.close();

const terraformApply = Deno.run({ cmd: ["terraform", "apply"] });
await terraformApply.status();
terraformApply.close();

const terraformOutput = Deno.run({
    cmd: ["terraform", "output", "server"],
    stdout: "piped",
});
const [_status, stdout] = await Promise.all([
    terraformOutput.status(),
    terraformOutput.output(),
]);
terraformOutput.close();
const serverIp = new TextDecoder().decode(stdout);
console.info(serverIp);

/**
 * Ansible
 */
Deno.chdir("..");
const ansibleStagingFile = (
    await Deno.readTextFile("./ansible/staging")
).replaceAll("{server_ip}", serverIp);
filesToWrite.push({
    path: `./ansible/staging`,
    content: ansibleStagingFile,
});

const defaultConf = (
    await Deno.readTextFile("./ansible/files/default.conf")
).replaceAll("{server_name}", serverName);
const yamlStagingFile = (
    await Deno.readTextFile("./ansible/group_vars/staging.yaml")
).replaceAll("{server_name}", serverName);
const frontendEnvFile = (await Deno.readTextFile("./frontend/.env")).replaceAll(
    "{server_name}",
    serverName
);

filesToWrite.push(
    { path: `./ansible/files/default.conf`, content: defaultConf },
    {
        path: `./ansible/group_vars/staging.yaml`,
        content: yamlStagingFile,
    },
    { path: `./frontend/.env`, content: frontendEnvFile }
);

const dockerComposeFile = (await Deno.readTextFile("./docker-compose.yaml"))
    .replaceAll("{frontend_image}", frontendImage)
    .replaceAll("{backend_image}", backendImage);

filesToWrite.push({
    path: `./docker-compose.yaml`,
    content: dockerComposeFile,
});

await Promise.all(
    filesToWrite.map(async (f) => {
        try {
            await Deno.writeTextFile(f.path, f.content, { create: f.create });
            console.info(`File ${f.path} has been overwritten`);
            return true;
        } catch (e) {
            alert(e);
            return false;
        }
    })
);

const build = prompt(
    "Do you want to build and push the docker images?",
    "yes"
) as string;

if (build === "yes" || build === "y") {
    const dockerLoginProcess = Deno.run({
        cmd: [
            "docker",
            "login",
            "rg.fr-par.scw.cloud/thetribe",
            "-u",
            "nologin",
            "-p",
            scwToken,
        ],
    });
    await dockerLoginProcess.status();
    dockerLoginProcess.close();

    const backendBuildProcess = Deno.run({
        cmd: ["./backend/build.sh", "--push"],
    });
    await backendBuildProcess.status();
    backendBuildProcess.close();

    const frontendBuildProcess = Deno.run({
        cmd: ["./frontend/build.sh", "--push"],
    });
    await frontendBuildProcess.status();
    frontendBuildProcess.close();

    const provision = prompt(
        "Do you want to provision your staging instance?",
        "yes"
    ) as string;

    if (provision === "yes" || provision === "y") {
        const provisionProcess = Deno.run({
            cmd: [
                "ansible-playbook",
                "-i",
                "./ansible/staging",
                "./ansible/provision.yaml",
            ],
        });

        await provisionProcess.status();
        provisionProcess.close();
    }
}
console.info("Done!");

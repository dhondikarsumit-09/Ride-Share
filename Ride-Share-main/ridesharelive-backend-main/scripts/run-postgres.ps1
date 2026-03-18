param(
    [switch]$SkipTests,
    [switch]$SkipDependencies
)

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$mavenArgs = @("spring-boot:run", "-Dspring-boot.run.profiles=postgres")

if ($SkipTests) {
    $mavenArgs = @("-DskipTests") + $mavenArgs
}

Push-Location $projectRoot
try {
    if (-not $SkipDependencies) {
        docker compose up -d postgresdb redis
    }

    & .\mvnw.cmd @mavenArgs
} finally {
    Pop-Location
}

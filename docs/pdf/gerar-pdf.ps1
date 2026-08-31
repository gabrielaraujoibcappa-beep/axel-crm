# Gera os PDFs da documentacao a partir dos capitulos em markdown.
#
# Requisitos: Node.js, Pandoc e Google Chrome instalados.
#
# Uso:
#   powershell -File docs\pdf\gerar-pdf.ps1              # gera os dois PDFs
#   powershell -File docs\pdf\gerar-pdf.ps1 -Only tecnica
#   powershell -File docs\pdf\gerar-pdf.ps1 -Only manual

param(
  [ValidateSet('todos', 'tecnica', 'manual')]
  [string]$Only = 'todos'
)

$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$docs = Split-Path -Parent $here
$work = Join-Path $env:TEMP 'axel-crm-pdf'

New-Item -ItemType Directory -Force -Path $work | Out-Null

$chrome = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chrome) { throw 'Google Chrome nao encontrado.' }

Copy-Item (Join-Path $here 'pdf.css') $work -Force

function Build-Pdf {
  param(
    [string]$Name,      # identificador usado nos arquivos temporarios
    [string]$Source,    # diretorio com os capitulos NN-*.md
    [string]$Cover,     # arquivo html da capa
    [string]$Title,     # titulo do documento
    [string]$Output     # caminho do pdf final
  )

  Write-Host "`n== $Title ==" -ForegroundColor Cyan

  # 1. Concatena os capitulos e reescreve os links internos como ancoras.
  node (Join-Path $here 'build-pdf.js') $Source (Join-Path $work "$Name.md")

  # 2. Markdown -> HTML com capa, sumario e folha de estilo de impressao.
  pandoc (Join-Path $work "$Name.md") `
    -f gfm -t html5 --standalone --toc --toc-depth=2 `
    --metadata title="$Title" `
    --css 'pdf.css' `
    --include-before-body (Join-Path $here $Cover) `
    -o (Join-Path $work "$Name.html")

  # 3. HTML -> PDF via Chrome headless.
  $url = 'file:///' + ((Join-Path $work "$Name.html") -replace '\\', '/')
  $chromeArgs = @(
    '--headless=new', '--disable-gpu', '--no-sandbox',
    "--user-data-dir=$work\chrome-profile",
    '--no-pdf-header-footer', '--virtual-time-budget=10000',
    "--print-to-pdf=$Output", $url
  )
  Start-Process -FilePath $chrome -ArgumentList $chromeArgs -NoNewWindow -Wait | Out-Null

  if (Test-Path $Output) {
    'PDF gerado: {0} ({1:N0} KB)' -f $Output, ((Get-Item $Output).Length / 1KB)
  } else {
    throw "A geracao de $Output falhou."
  }
}

if ($Only -in @('todos', 'tecnica')) {
  Build-Pdf -Name 'tecnica' `
    -Source $docs `
    -Cover 'cover.html' `
    -Title 'Axel CRM' `
    -Output (Join-Path $docs 'axel-crm-documentacao.pdf')
}

if ($Only -in @('todos', 'manual')) {
  Build-Pdf -Name 'manual' `
    -Source (Join-Path $docs 'manual-do-usuario') `
    -Cover 'cover-manual.html' `
    -Title 'Axel CRM - Manual do Usuario' `
    -Output (Join-Path $docs 'axel-crm-manual-do-usuario.pdf')
}

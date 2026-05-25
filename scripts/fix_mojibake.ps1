# Conserta arquivos com mojibake (UTF-8 lido como CP1252).
# Usa Unicode codepoint escapes pra nao depender do encoding deste script.
# Uso: powershell -File scripts\fix_mojibake.ps1 [-Path <dir>] [-DryRun]

param(
  [string]$Path = 'app',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# Mapa de mojibake -> correto. Cada chave/valor montado via [char]
# pra nao depender do encoding em que este arquivo .ps1 foi salvo.
function Pair([int[]]$badCodepoints, [int]$goodCodepoint) {
  $bad  = -join ($badCodepoints | ForEach-Object { [char]$_ })
  $good = [string][char]$goodCodepoint
  return @{ Bad = $bad; Good = $good }
}

# Mojibake do tipo UTF-8 lido como CP1252:
# o caractere correto em UTF-8 ocupa 2 bytes, e cada byte vira um caracter latino.
$pairs = @(
  # Letras minusculas pt-BR (a-z)
  Pair @(0xC3, 0xA1) 0xE1 # á
  Pair @(0xC3, 0xA0) 0xE0 # à
  Pair @(0xC3, 0xA2) 0xE2 # â
  Pair @(0xC3, 0xA3) 0xE3 # ã
  Pair @(0xC3, 0xA4) 0xE4 # ä
  Pair @(0xC3, 0xA9) 0xE9 # é
  Pair @(0xC3, 0xAA) 0xEA # ê
  Pair @(0xC3, 0xAB) 0xEB # ë
  Pair @(0xC3, 0xAD) 0xED # í
  Pair @(0xC3, 0xAE) 0xEE # î
  Pair @(0xC3, 0xAF) 0xEF # ï
  Pair @(0xC3, 0xB3) 0xF3 # ó
  Pair @(0xC3, 0xB4) 0xF4 # ô
  Pair @(0xC3, 0xB5) 0xF5 # õ
  Pair @(0xC3, 0xB6) 0xF6 # ö
  Pair @(0xC3, 0xBA) 0xFA # ú
  Pair @(0xC3, 0xBB) 0xFB # û
  Pair @(0xC3, 0xBC) 0xFC # ü
  Pair @(0xC3, 0xA7) 0xE7 # ç
  Pair @(0xC3, 0xB1) 0xF1 # ñ
  Pair @(0xC3, 0xB8) 0xF8 # ø
  # Letras maiusculas
  Pair @(0xC3, 0x81) 0xC1 # Á
  Pair @(0xC3, 0x80) 0xC0 # À
  Pair @(0xC3, 0x82) 0xC2 # Â
  Pair @(0xC3, 0x83) 0xC3 # Ã
  Pair @(0xC3, 0x84) 0xC4 # Ä
  Pair @(0xC3, 0x89) 0xC9 # É
  Pair @(0xC3, 0x8A) 0xCA # Ê
  Pair @(0xC3, 0x8B) 0xCB # Ë
  Pair @(0xC3, 0x8D) 0xCD # Í
  Pair @(0xC3, 0x8E) 0xCE # Î
  Pair @(0xC3, 0x93) 0xD3 # Ó
  Pair @(0xC3, 0x94) 0xD4 # Ô
  Pair @(0xC3, 0x95) 0xD5 # Õ
  Pair @(0xC3, 0x96) 0xD6 # Ö
  Pair @(0xC3, 0x9A) 0xDA # Ú
  Pair @(0xC3, 0x9B) 0xDB # Û
  Pair @(0xC3, 0x9C) 0xDC # Ü
  Pair @(0xC3, 0x87) 0xC7 # Ç
  Pair @(0xC3, 0x91) 0xD1 # Ñ
  # Espacos e simbolos comuns
  Pair @(0xC2, 0xA0) 0x20  # NBSP -> espaco normal
  Pair @(0xC2, 0xB7) 0xB7  # ·
  Pair @(0xC2, 0xB0) 0xB0  # °
  Pair @(0xC2, 0xAB) 0xAB  # «
  Pair @(0xC2, 0xBB) 0xBB  # »
  Pair @(0xC2, 0xA9) 0xA9  # ©
  Pair @(0xC2, 0xAE) 0xAE  # ®
  Pair @(0xC2, 0xB1) 0xB1  # ±
  Pair @(0xC2, 0xBF) 0xBF  # ¿
  Pair @(0xC2, 0xA1) 0xA1  # ¡
)

# Multi-byte (UTF-8 de 3 bytes) viu mojibake de 3 caracteres latinos.
# Substituicoes especificas pra aspas inteligentes / dashes.
$tripleMap = @{
  ([char]0xE2 + [char]0x80 + [char]0x99) = [string][char]0x2019 # '
  ([char]0xE2 + [char]0x80 + [char]0x98) = [string][char]0x2018 # '
  ([char]0xE2 + [char]0x80 + [char]0x9C) = [string][char]0x201C # "
  ([char]0xE2 + [char]0x80 + [char]0x9D) = [string][char]0x201D # "
  ([char]0xE2 + [char]0x80 + [char]0x93) = [string][char]0x2013 # –
  ([char]0xE2 + [char]0x80 + [char]0x94) = [string][char]0x2014 # —
  ([char]0xE2 + [char]0x80 + [char]0xA6) = [string][char]0x2026 # …
  ([char]0xE2 + [char]0x80 + [char]0xA2) = [string][char]0x2022 # •
  ([char]0xE2 + [char]0x82 + [char]0xAC) = [string][char]0x20AC # €
}

$extensions = '.ts','.tsx','.js','.jsx','.rb','.css','.md','.txt','.yml','.yaml'
$skipDirs = 'node_modules','dist','tmp','log','.git','.playwright-mcp','vendor','coverage'

$root = Resolve-Path $Path
$files = Get-ChildItem -Path $root -Recurse -File | Where-Object {
  $ext = $_.Extension.ToLower()
  if ($ext -notin $extensions) { return $false }
  foreach ($skip in $skipDirs) {
    if ($_.FullName -like "*\$skip\*") { return $false }
  }
  return $true
}

Write-Host "Scanning $($files.Count) files (DryRun=$DryRun)..."
$changed = 0

foreach ($file in $files) {
  $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  if (-not $text) { continue }

  $original = $text

  # Triplets primeiro, pra nao engolir os pares.
  foreach ($k in @($tripleMap.Keys)) {
    if ($text.Contains($k)) {
      $text = $text.Replace($k, $tripleMap[$k])
    }
  }

  foreach ($p in $pairs) {
    if ($text.Contains($p.Bad)) {
      $text = $text.Replace($p.Bad, $p.Good)
    }
  }

  if ($text -ne $original) {
    if ($DryRun) {
      Write-Host "[would-fix] $($file.Name)"
    } else {
      [System.IO.File]::WriteAllText($file.FullName, $text, [System.Text.UTF8Encoding]::new($false))
      Write-Host "[fix]  $($file.Name)"
    }
    $changed++
  }
}

Write-Host "Done. Files changed: $changed"

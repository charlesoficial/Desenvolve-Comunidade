# Quando a saida em UTF-8 acabou contendo bytes Latin-1 puros (0x80-0xFF
# fora de sequencia UTF-8 valida), reencodifica cada byte invalido como
# UTF-8 (Latin-1 codepoint -> 2 bytes UTF-8).

param([Parameter(Mandatory=$true)][string]$File)

if (-not (Test-Path $File)) { throw "File not found: $File" }

$bytes = [System.IO.File]::ReadAllBytes($File)
$out = New-Object System.Collections.Generic.List[byte]

function IsValidContinuation($b) {
  return ($b -ge 0x80 -and $b -le 0xBF)
}

$i = 0
while ($i -lt $bytes.Length) {
  $b = $bytes[$i]
  if ($b -lt 0x80) {
    $out.Add($b); $i++; continue
  }

  $valid = $false
  $consume = 1
  if ($b -ge 0xC2 -and $b -le 0xDF) {
    if ($i + 1 -lt $bytes.Length -and (IsValidContinuation $bytes[$i+1])) {
      $valid = $true; $consume = 2
    }
  } elseif ($b -ge 0xE0 -and $b -le 0xEF) {
    if ($i + 2 -lt $bytes.Length -and (IsValidContinuation $bytes[$i+1]) -and (IsValidContinuation $bytes[$i+2])) {
      $valid = $true; $consume = 3
    }
  } elseif ($b -ge 0xF0 -and $b -le 0xF4) {
    if ($i + 3 -lt $bytes.Length -and (IsValidContinuation $bytes[$i+1]) -and (IsValidContinuation $bytes[$i+2]) -and (IsValidContinuation $bytes[$i+3])) {
      $valid = $true; $consume = 4
    }
  }

  if ($valid) {
    for ($j = 0; $j -lt $consume; $j++) { $out.Add($bytes[$i + $j]) }
    $i += $consume
  } else {
    # Recodifica esse byte solitario como UTF-8 (Latin-1 -> UTF-8).
    # Codepoint = $b. Em UTF-8, codepoints 0x80-0xFF viram 2 bytes:
    #   0xC0 | ($b >> 6),  0x80 | ($b -band 0x3F)
    $high = 0xC0 -bor ($b -shr 6)
    $low  = 0x80 -bor ($b -band 0x3F)
    $out.Add($high); $out.Add($low)
    $i++
  }
}

[System.IO.File]::WriteAllBytes($File, $out.ToArray())
Write-Host "Repaired $File ($($bytes.Length) -> $($out.Count) bytes)"

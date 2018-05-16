---
id: Utils_Ownable
title: Ownable
---

<div class="contract-doc"><div class="contract"><h2 class="contract-header"><span class="contract-kind">contract</span> Ownable</h2><div class="source">Source: <a href="git+https://github.com/DecenterApps/DigitalPrint/blob/v1.0.0/contracts/Utils/Ownable.sol" target="_blank">Utils/Ownable.sol</a></div></div><div class="index"><h2>Index</h2><ul><li><a href="Utils_Ownable.html#OwnershipTransferred">OwnershipTransferred</a></li><li><a href="Utils_Ownable.html#">fallback</a></li><li><a href="Utils_Ownable.html#onlyOwner">onlyOwner</a></li><li><a href="Utils_Ownable.html#transferOwnership">transferOwnership</a></li></ul></div><div class="reference"><h2>Reference</h2><div class="events"><h3>Events</h3><ul><li><div class="item event"><span id="OwnershipTransferred" class="anchor-marker"></span><h4 class="name">OwnershipTransferred</h4><div class="body"><code class="signature">event <strong>OwnershipTransferred</strong><span>(address previousOwner, address newOwner) </span></code><hr/><dl><dt><span class="label-parameters">Parameters:</span></dt><dd><div><code>previousOwner</code> - address</div><div><code>newOwner</code> - address</div></dd></dl></div></div></li></ul></div><div class="modifiers"><h3>Modifiers</h3><ul><li><div class="item modifier"><span id="onlyOwner" class="anchor-marker"></span><h4 class="name">onlyOwner</h4><div class="body"><code class="signature">modifier <strong>onlyOwner</strong><span>() </span></code><hr/></div></div></li></ul></div><div class="functions"><h3>Functions</h3><ul><li><div class="item function"><span id="fallback" class="anchor-marker"></span><h4 class="name">fallback</h4><div class="body"><code class="signature">function <strong></strong><span>() </span><span>public </span></code><hr/></div></div></li><li><div class="item function"><span id="transferOwnership" class="anchor-marker"></span><h4 class="name">transferOwnership</h4><div class="body"><code class="signature">function <strong>transferOwnership</strong><span>(address newOwner) </span><span>public </span></code><hr/><dl><dt><span class="label-modifiers">Modifiers:</span></dt><dd><a href="Utils_Ownable.html#onlyOwner">onlyOwner </a></dd><dt><span class="label-parameters">Parameters:</span></dt><dd><div><code>newOwner</code> - address</div></dd></dl></div></div></li></ul></div></div></div>
<script lang="ts">
    import { onMount } from 'svelte';
    import { Card } from '$lib/components/ui/card';
    import { Input } from '$lib/components/ui/input';

    let products: any[] = [];
    let categories: any[] = [];

    // Filter state
    let searchName = '';
    let selectedCategoryId = '';

    // Pagination state
    let currentPage = 1;
    let pageSize = 10;
    let totalItems = 0;
    let totalPages = 1;
    let isLoading = false;

    onMount(async () => {
        await loadCategories();
        await loadProducts();
    });

    async function loadCategories() {
        try {
            const res = await fetch('http://localhost:3000/api/categories');
            const response = await res.json();
            categories = response.data || response;
        } catch (err) {
            console.error('Failed to load categories:', err);
            categories = [];
        }
    }

    async function loadProducts() {
        isLoading = true;
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString(),
            });

            if (searchName.trim()) {
                params.append('name', searchName.trim());
            }

            if (selectedCategoryId) {
                params.append('categoryId', selectedCategoryId);
            }

            const res = await fetch(`http://localhost:3000/api/products?${params.toString()}`);
            const response = await res.json();

            console.log('API response:', response);

            products = response.data || [];

            if (response.pagination) {
                totalItems = response.pagination.total || 0;
                currentPage = response.pagination.page || currentPage;
                pageSize = response.pagination.limit || pageSize;
                totalPages = response.pagination.totalPages || Math.ceil(totalItems / pageSize);
            } else {
                totalItems = products.length;
                totalPages = Math.ceil(totalItems / pageSize);
            }
        } catch (err) {
            console.error('Failed to load products:', err);
            products = [];
        } finally {
            isLoading = false;
        }
    }

    async function changePage(page: number) {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            currentPage = page;
            await loadProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function applyFilters() {
        currentPage = 1;
        loadProducts();
    }


    $: pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
</script>

<div class="space-y-6">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Product Catalog</h1>
        <a
                href="/products/create"
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
            + Create Product
        </a>
    </div>

    <Card class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
                <label for="search" class="text-sm font-medium">Search by name</label>
                <Input
                        id="search"
                        type="text"
                        placeholder="Enter product name..."
                        bind:value={searchName}
                />
            </div>

            <div class="space-y-2">
                <label for="category" class="text-sm font-medium">Category</label>
                <select
                        id="category"
                        bind:value={selectedCategoryId}
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <option value="">All Categories</option>
                    {#each categories as category}
                        <option value={category.id}>{category.name}</option>
                    {/each}
                </select>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium invisible">Apply</label>
                <button
                        type="button"
                        on:click={applyFilters}
                        disabled={isLoading}
                        class="w-full h-10 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
                >
                    {isLoading ? 'Loading...' : 'Apply Filters'}
                </button>
            </div>
        </div>

        <div class="mt-3 text-sm text-gray-600">
            {#if isLoading}
                Loading...
            {:else}
                Showing {products.length} products (Total: {totalItems})
            {/if}
        </div>
    </Card>

    {#if isLoading}
        <Card class="p-8 text-center">
            <div class="animate-pulse space-y-4">
                <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
        </Card>
    {:else if products.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each products as product}
                <Card class="p-4 hover:shadow-lg transition-shadow">
                    <h2 class="text-lg font-semibold mb-2">{product.name}</h2>
                    {#if product.category?.name}
                        <span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mb-2">
                            {product.category.name}
                        </span>
                    {/if}
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description || 'No description'}
                    </p>
                    <p class="text-xl font-bold text-primary">${product.price}</p>
                    <a
                            href={`/products/${product.id}`}
                            class="mt-3 inline-block text-sm text-blue-600 hover:underline"
                    >
                        View details →
                    </a>
                </Card>
            {/each}
        </div>
    {:else}
        <Card class="p-8 text-center">
            <p class="text-gray-500">No products found matching your filters.</p>
        </Card>
    {/if}

    <!-- Pagination -->
    {#if totalPages > 1 && !isLoading}
        <Card class="p-6 bg-white">
            <div class="flex items-center justify-center gap-3 flex-wrap">
                <button
                        type="button"
                        on:click={() => changePage(currentPage - 1)}
                        disabled={currentPage === 1}
                        class="px-4 py-2 rounded-md border-2 border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    ← Previous
                </button>

                {#each pageNumbers as pageNum}
                    {#if pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)}
                        <button
                                type="button"
                                on:click={() => changePage(pageNum)}
                                class="px-4 py-2 rounded-md border-2 transition-colors min-w-[45px] font-medium"
                                class:bg-blue-600={currentPage === pageNum}
                                class:text-white={currentPage === pageNum}
                                class:border-blue-600={currentPage === pageNum}
                                class:border-gray-300={currentPage !== pageNum}
                                class:hover:bg-gray-100={currentPage !== pageNum}
                        >
                            {pageNum}
                        </button>
                    {:else if pageNum === currentPage - 2 || pageNum === currentPage + 2}
                        <span class="px-2 text-gray-500">...</span>
                    {/if}
                {/each}

                <button
                        type="button"
                        on:click={() => changePage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        class="px-4 py-2 rounded-md border-2 border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    Next →
                </button>
            </div>

            <div class="text-center mt-4 text-base text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
            </div>
        </Card>
    {/if}
</div>
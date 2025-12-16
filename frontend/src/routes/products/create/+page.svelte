<script lang="ts">
    import { onMount } from 'svelte';
    import { Input } from '@/components/ui/input';

    let name = '';
    let description = '';
    let price = 0;
    let categoryId = '';
    let categories: any[] = [];
    let message = '';
    let isLoading = false;
    let isSuccess = false;

    onMount(async () => {
        await loadCategories();
    });

    async function loadCategories() {
        try {
            const res = await fetch('http://localhost:3000/api/categories');
            const response = await res.json();
            categories = response.data || response;
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    }

    async function handleCreate() {
        if (!name.trim()) {
            message = 'Please enter product name';
            return;
        }

        if (price <= 0) {
            message = 'Price must be greater than 0';
            return;
        }

        isLoading = true;
        message = '';

        try {
            const res = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    price: Number(price),
                    categoryId: categoryId || null,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create product');
            }

            const product = await res.json();
            console.log('Created product:', product);

            isSuccess = true;
            message = 'Product created successfully!';

            // Reset form
            setTimeout(() => {
                name = '';
                description = '';
                price = 0;
                categoryId = '';
                message = '';
                isSuccess = false;
            }, 2000);

        } catch (err) {
            message = 'Error: ' + (err instanceof Error ? err.message : String(err));
            console.error(err);
        } finally {
            isLoading = false;
        }
    }

    function handleCancel() {
        window.location.href = '/';
    }
</script>

<div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Create New Product</h1>
        <button
                type="button"
                on:click={handleCancel}
                class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
            ← Back to Products
        </button>
    </div>

    {#if message}
        <div
                class="p-4 rounded-md border"
                class:bg-green-50={isSuccess}
                class:border-green-200={isSuccess}
                class:text-green-800={isSuccess}
                class:bg-red-50={!isSuccess}
                class:border-red-200={!isSuccess}
                class:text-red-800={!isSuccess}
        >
            {message}
        </div>
    {/if}

    <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <form on:submit|preventDefault={handleCreate} class="space-y-6">
            <!-- Product Name -->
            <div class="space-y-2">
                <label for="name" class="text-sm font-medium block">
                    Product Name <span class="text-red-500">*</span>
                </label>
                <Input
                        id="name"
                        type="text"
                        placeholder="Enter product name"
                        bind:value={name}
                        disabled={isLoading}
                        required
                />
            </div>

            <!-- Description -->
            <div class="space-y-2">
                <label for="description" class="text-sm font-medium block">
                    Description
                </label>
                <textarea
                        id="description"
                        placeholder="Enter product description (optional)"
                        bind:value={description}
                        disabled={isLoading}
                        rows="4"
                        class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                ></textarea>
            </div>

            <!-- Price -->
            <div class="space-y-2">
                <label for="price" class="text-sm font-medium block">
                    Price <span class="text-red-500">*</span>
                </label>
                <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        bind:value={price}
                        disabled={isLoading}
                        required
                />
            </div>

            <!-- Category -->
            <div class="space-y-2">
                <label for="category" class="text-sm font-medium block">
                    Category
                </label>
                <select
                        id="category"
                        bind:value={categoryId}
                        disabled={isLoading}
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">No Category</option>
                    {#each categories as category}
                        <option value={category.id}>{category.name}</option>
                    {/each}
                </select>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
                <button
                        type="submit"
                        disabled={isLoading}
                        class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    {isLoading ? 'Creating...' : 'Create Product'}
                </button>
                <button
                        type="button"
                        on:click={handleCancel}
                        disabled={isLoading}
                        class="px-6 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
</div>
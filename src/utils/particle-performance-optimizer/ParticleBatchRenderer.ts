/**
 * Particle Batch Renderer
 * パーティクルバッチレンダラー - 効率的なパーティクル描画システム
 */

// Types for particle batch rendering
interface BatchConfig {
    enabled: boolean;
    maxBatchSize: number;
    maxInstances: number;
    sortByTexture: boolean;
    sortByBlendMode: boolean;
    bufferReuse: boolean;
    dynamicBuffering: boolean;
    frustumCulling: boolean;
    instancing: boolean;
    atlasOptimization: boolean;
}

interface Batch {
    material: string;
    particles: Particle[];
    vertexBuffer: Float32Array | null;
    indexBuffer: Uint16Array | null;
    boundingBox: BoundingBox | null;
    texture: any;
    blendMode: string;
    shader: any;
    drawCalls: number;
    vertexCount: number;
    triangleCount: number;
}

interface BatchManager {
    batches: Map<string, Batch>;
    activeBatches: Batch[];
    batchPool: Batch[];
    maxBatches: number;
    vertexBuffers: Map<string, any>;
    indexBuffers: Map<string, any>;
    currentBuffer: any;
    bufferPool: any[];
}

interface TextureAtlas {
    enabled: boolean;
    atlas: any;
    atlasSize: number;
    atlasSlots: Map<string, number>;
    freeSlots: number[];
    slotSize: number;
    utilization: number;
    fragmentation: number;
    totalSlots: number;
    usedSlots: number;
}

interface InstanceBuffer {
    transforms: Float32Array | null;
    colors: Float32Array | null;
    uvs: Float32Array | null;
    count: number;
    maxInstances: number;
}

interface RenderingStats {
    batchesCreated: number;
    batchesReused: number;
    particlesRendered: number;
    drawCalls: number;
    verticesRendered: number;
    trianglesRendered: number;
    batchingTime: number;
    renderingTime: number;
    bufferTime: number;
    sortingTime: number;
    batchEfficiency: number;
    averageBatchSize: number;
    fillRate: number;
}

interface Particle {
    x: number;
    y: number;
    z?: number;
    size?: number;
    color?: string;
    opacity?: number;
    texture?: string;
    type?: string;
    blendMode?: string;
    shader?: string;
    depth?: number;
}

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ParticleBatchRendererConfig {
    enabled?: boolean;
    maxBatchSize?: number;
    maxInstances?: number;
    sortByTexture?: boolean;
    sortByBlendMode?: boolean;
    bufferReuse?: boolean;
    dynamicBuffering?: boolean;
    frustumCulling?: boolean;
    instancing?: boolean;
    atlasOptimization?: boolean;
    maxBatches?: number;
    atlasSize?: number;
    slotSize?: number;
}

export class ParticleBatchRenderer {
    private batchConfig: BatchConfig;
    private batchManager: BatchManager;
    private textureAtlas: TextureAtlas;
    private instanceBuffer: InstanceBuffer;
    private stats: RenderingStats;

    constructor(config: ParticleBatchRendererConfig = {}) {
        // Batch rendering configuration
        this.batchConfig = {
            enabled: config.enabled !== undefined ? config.enabled : true,
            maxBatchSize: config.maxBatchSize || 1000,
            maxInstances: config.maxInstances || 2000,
            sortByTexture: config.sortByTexture !== undefined ? config.sortByTexture : true,
            sortByBlendMode: config.sortByBlendMode !== undefined ? config.sortByBlendMode : true,
            
            // Buffer management
            bufferReuse: config.bufferReuse !== undefined ? config.bufferReuse : true,
            dynamicBuffering: config.dynamicBuffering !== undefined ? config.dynamicBuffering : true,
            
            // Optimization settings
            frustumCulling: config.frustumCulling !== undefined ? config.frustumCulling : true,
            instancing: config.instancing !== undefined ? config.instancing : true,
            atlasOptimization: config.atlasOptimization !== undefined ? config.atlasOptimization : true
        };
        
        // Batch management
        this.batchManager = {
            batches: new Map(), // Material/Texture -> Batch
            activeBatches: [],
            batchPool: [],
            maxBatches: config.maxBatches || 50,
            
            // Vertex buffer management
            vertexBuffers: new Map(),
            indexBuffers: new Map(),
            currentBuffer: null,
            bufferPool: []
        };
        
        // Texture atlas management
        this.textureAtlas = {
            enabled: this.batchConfig.atlasOptimization,
            atlas: null,
            atlasSize: config.atlasSize || 2048,
            atlasSlots: new Map(),
            freeSlots: [],
            slotSize: config.slotSize || 64,
            
            // Atlas statistics
            utilization: 0,
            fragmentation: 0,
            totalSlots: 0,
            usedSlots: 0
        };
        
        // Instance buffer for efficient rendering
        this.instanceBuffer = {
            transforms: null,
            colors: null,
            uvs: null,
            count: 0,
            maxInstances: this.batchConfig.maxInstances
        };
        
        // Rendering statistics
        this.stats = {
            batchesCreated: 0,
            batchesReused: 0,
            particlesRendered: 0,
            drawCalls: 0,
            verticesRendered: 0,
            trianglesRendered: 0,
            
            // Performance metrics
            batchingTime: 0,
            renderingTime: 0,
            bufferTime: 0,
            sortingTime: 0,
            
            // Efficiency metrics
            batchEfficiency: 0,
            averageBatchSize: 0,
            fillRate: 0
        };
        
        this.initializeBatchRenderer();
    }
    
    /**
     * Initialize batch renderer components
     */
    private initializeBatchRenderer(): void {
        this.initializeBuffers();
        this.initializeTextureAtlas();
        
        console.log('[ParticleBatchRenderer] Batch renderer initialized');
    }
    
    /**
     * Initialize rendering buffers
     */
    private initializeBuffers(): void {
        // Initialize instance buffer arrays
        this.instanceBuffer.transforms = new Float32Array(this.instanceBuffer.maxInstances * 16); // 4x4 matrices
        this.instanceBuffer.colors = new Float32Array(this.instanceBuffer.maxInstances * 4); // RGBA
        this.instanceBuffer.uvs = new Float32Array(this.instanceBuffer.maxInstances * 4); // UV coordinates
        this.instanceBuffer.count = 0;
        
        console.log('[ParticleBatchRenderer] Buffers initialized for', this.instanceBuffer.maxInstances, 'instances');
    }
    
    /**
     * Initialize texture atlas
     */
    private initializeTextureAtlas(): void {
        if (!this.textureAtlas.enabled) return;
        
        const slotsPerRow = Math.floor(this.textureAtlas.atlasSize / this.textureAtlas.slotSize);
        const totalRows = Math.floor(this.textureAtlas.atlasSize / this.textureAtlas.slotSize);
        this.textureAtlas.totalSlots = slotsPerRow * totalRows;
        
        // Initialize free slots
        this.textureAtlas.freeSlots = [];
        for (let i = 0; i < this.textureAtlas.totalSlots; i++) {
            this.textureAtlas.freeSlots.push(i);
        }
        
        console.log('[ParticleBatchRenderer] Texture atlas initialized:', this.textureAtlas.totalSlots, 'slots');
    }
    
    /**
     * Create optimized render batches from particles
     */
    createRenderBatches(particles: Particle[]): Batch[] {
        const batchingStart = performance.now();
        
        // Reset batch statistics
        this.stats.batchesCreated = 0;
        this.stats.batchesReused = 0;
        
        // Clear active batches
        this.batchManager.activeBatches.length = 0;
        
        // Sort particles for optimal batching
        const sortedParticles = this.sortParticlesForBatching(particles);
        
        // Group particles into batches
        const batches = this.groupParticlesIntoBatches(sortedParticles);
        
        // Optimize batches
        const optimizedBatches = this.optimizeBatches(batches);
        
        // Update statistics
        this.stats.batchingTime = performance.now() - batchingStart;
        this.stats.averageBatchSize = particles.length / Math.max(1, optimizedBatches.length);
        this.stats.batchEfficiency = this.calculateBatchEfficiency(optimizedBatches);
        
        return optimizedBatches;
    }
    
    /**
     * Sort particles for optimal batching
     */
    private sortParticlesForBatching(particles: Particle[]): Particle[] {
        const sortingStart = performance.now();
        
        const sorted = [...particles].sort((a, b) => {
            // Primary: Sort by texture/material
            if (this.batchConfig.sortByTexture) {
                const textureA = a.texture || a.type || 'default';
                const textureB = b.texture || b.type || 'default';
                if (textureA !== textureB) {
                    return textureA.localeCompare(textureB);
                }
            }
            
            // Secondary: Sort by blend mode
            if (this.batchConfig.sortByBlendMode) {
                const blendA = a.blendMode || 'normal';
                const blendB = b.blendMode || 'normal';
                if (blendA !== blendB) {
                    return blendA.localeCompare(blendB);
                }
            }
            
            // Tertiary: Sort by Z-order/depth
            const depthA = a.depth || a.z || 0;
            const depthB = b.depth || b.z || 0;
            return depthA - depthB;
        });
        
        this.stats.sortingTime = performance.now() - sortingStart;
        return sorted;
    }
    
    /**
     * Group particles into batches
     */
    private groupParticlesIntoBatches(particles: Particle[]): Batch[] {
        const batches: Batch[] = [];
        let currentBatch: Batch | null = null;
        let currentMaterial: string | null = null;
        
        for (const particle of particles) {
            const material = this.getParticleMaterial(particle);
            
            // Create new batch if material changed or batch is full
            if (!currentBatch || 
                material !== currentMaterial || 
                currentBatch.particles.length >= this.batchConfig.maxBatchSize) {
                
                if (currentBatch) {
                    batches.push(currentBatch);
                }
                
                currentBatch = this.createBatch(material);
                currentMaterial = material;
                this.stats.batchesCreated++;
            }
            
            currentBatch.particles.push(particle);
        }
        
        // Add final batch
        if (currentBatch && currentBatch.particles.length > 0) {
            batches.push(currentBatch);
        }
        
        return batches;
    }
    
    /**
     * Create a new render batch
     */
    private createBatch(material: string): Batch {
        // Try to reuse batch from pool
        let batch = this.batchManager.batchPool.pop();
        if (batch) {
            batch.particles.length = 0;
            batch.material = material;
            this.stats.batchesReused++;
        } else {
            batch = {
                material,
                particles: [],
                vertexBuffer: null,
                indexBuffer: null,
                boundingBox: null,
                
                // Rendering state
                texture: null,
                blendMode: 'normal',
                shader: null,
                
                // Statistics
                drawCalls: 0,
                vertexCount: 0,
                triangleCount: 0
            };
        }
        
        return batch;
    }
    
    /**
     * Get material identifier for particle
     */
    private getParticleMaterial(particle: Particle): string {
        const texture = particle.texture || particle.type || 'default';
        const blendMode = particle.blendMode || 'normal';
        const shader = particle.shader || 'default';
        
        return `${texture}_${blendMode}_${shader}`;
    }
    
    /**
     * Optimize render batches
     */
    private optimizeBatches(batches: Batch[]): Batch[] {
        const optimized: Batch[] = [];
        
        for (const batch of batches) {
            // Skip empty batches
            if (batch.particles.length === 0) continue;
            
            // Calculate bounding box
            batch.boundingBox = this.calculateBatchBoundingBox(batch.particles);
            
            // Prepare vertex data
            this.prepareBatchVertexData(batch);
            
            // Apply texture atlas optimization
            if (this.textureAtlas.enabled) {
                this.optimizeBatchTextureUsage(batch);
            }
            
            optimized.push(batch);
        }
        
        return optimized;
    }
    
    /**
     * Calculate bounding box for batch particles
     */
    private calculateBatchBoundingBox(particles: Particle[]): BoundingBox {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const particle of particles) {
            const size = particle.size || 10;
            const halfSize = size / 2;
            
            minX = Math.min(minX, particle.x - halfSize);
            minY = Math.min(minY, particle.y - halfSize);
            maxX = Math.max(maxX, particle.x + halfSize);
            maxY = Math.max(maxY, particle.y + halfSize);
        }
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    /**
     * Prepare vertex data for batch
     */
    private prepareBatchVertexData(batch: Batch): void {
        const particles = batch.particles;
        const vertexData = new Float32Array(particles.length * 16); // 4 vertices * 4 components
        const indexData = new Uint16Array(particles.length * 6); // 2 triangles * 3 indices
        
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            const size = particle.size || 10;
            const halfSize = size / 2;
            
            // Vertex positions (x, y, u, v)
            const baseVertex = i * 16;
            const baseIndex = i * 6;
            const vertexIndex = i * 4;
            
            // Bottom-left
            vertexData[baseVertex + 0] = particle.x - halfSize;
            vertexData[baseVertex + 1] = particle.y - halfSize;
            vertexData[baseVertex + 2] = 0.0; // u
            vertexData[baseVertex + 3] = 0.0; // v
            
            // Bottom-right
            vertexData[baseVertex + 4] = particle.x + halfSize;
            vertexData[baseVertex + 5] = particle.y - halfSize;
            vertexData[baseVertex + 6] = 1.0; // u
            vertexData[baseVertex + 7] = 0.0; // v
            
            // Top-right
            vertexData[baseVertex + 8] = particle.x + halfSize;
            vertexData[baseVertex + 9] = particle.y + halfSize;
            vertexData[baseVertex + 10] = 1.0; // u
            vertexData[baseVertex + 11] = 1.0; // v
            
            // Top-left
            vertexData[baseVertex + 12] = particle.x - halfSize;
            vertexData[baseVertex + 13] = particle.y + halfSize;
            vertexData[baseVertex + 14] = 0.0; // u
            vertexData[baseVertex + 15] = 1.0; // v
            
            // Triangle indices
            indexData[baseIndex + 0] = vertexIndex + 0;
            indexData[baseIndex + 1] = vertexIndex + 1;
            indexData[baseIndex + 2] = vertexIndex + 2;
            indexData[baseIndex + 3] = vertexIndex + 0;
            indexData[baseIndex + 4] = vertexIndex + 2;
            indexData[baseIndex + 5] = vertexIndex + 3;
        }
        
        batch.vertexBuffer = vertexData;
        batch.indexBuffer = indexData;
        batch.vertexCount = particles.length * 4;
        batch.triangleCount = particles.length * 2;
    }
    
    /**
     * Optimize batch texture usage
     */
    private optimizeBatchTextureUsage(batch: Batch): void {
        // Texture atlas optimization would be implemented here
        // For now, this is a placeholder
        const textureKey = batch.material.split('_')[0];
        
        if (!this.textureAtlas.atlasSlots.has(textureKey)) {
            // Allocate atlas slot if available
            if (this.textureAtlas.freeSlots.length > 0) {
                const slot = this.textureAtlas.freeSlots.pop()!;
                this.textureAtlas.atlasSlots.set(textureKey, slot);
                this.textureAtlas.usedSlots++;
                this.textureAtlas.utilization = this.textureAtlas.usedSlots / this.textureAtlas.totalSlots;
            }
        }
    }
    
    /**
     * Calculate batch efficiency
     */
    private calculateBatchEfficiency(batches: Batch[]): number {
        if (batches.length === 0) return 1;
        
        const totalParticles = batches.reduce((sum, batch) => sum + batch.particles.length, 0);
        const averageParticlesPerBatch = totalParticles / batches.length;
        const targetBatchSize = this.batchConfig.maxBatchSize;
        
        return Math.min(1, averageParticlesPerBatch / targetBatchSize);
    }
    
    /**
     * Render batches using Canvas 2D context
     */
    renderBatches(ctx: CanvasRenderingContext2D, batches: Batch[]): void {
        const renderStart = performance.now();
        
        this.stats.drawCalls = 0;
        this.stats.particlesRendered = 0;
        this.stats.verticesRendered = 0;
        this.stats.trianglesRendered = 0;
        
        for (const batch of batches) {
            this.renderBatch(ctx, batch);
        }
        
        this.stats.renderingTime = performance.now() - renderStart;
    }
    
    /**
     * Render individual batch
     */
    private renderBatch(ctx: CanvasRenderingContext2D, batch: Batch): void {
        // Set batch-specific rendering state
        const previousGlobalCompositeOperation = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = batch.blendMode || 'normal';
        
        // Render each particle in the batch
        for (const particle of batch.particles) {
            this.renderParticle(ctx, particle);
        }
        
        // Restore rendering state
        ctx.globalCompositeOperation = previousGlobalCompositeOperation;
        
        // Update statistics
        this.stats.drawCalls++;
        this.stats.particlesRendered += batch.particles.length;
        this.stats.verticesRendered += batch.vertexCount;
        this.stats.trianglesRendered += batch.triangleCount;
    }
    
    /**
     * Render individual particle
     */
    private renderParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
        const size = particle.size || 10;
        const color = particle.color || '#ffffff';
        const opacity = particle.opacity !== undefined ? particle.opacity : 1;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        
        // Simple circle rendering for now
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Get rendering statistics
     */
    getStats(): object {
        return { 
            ...this.stats,
            textureAtlas: {
                utilization: this.textureAtlas.utilization,
                usedSlots: this.textureAtlas.usedSlots,
                totalSlots: this.textureAtlas.totalSlots
            }
        };
    }
    
    /**
     * Reset statistics
     */
    resetStats(): void {
        this.stats.batchesCreated = 0;
        this.stats.batchesReused = 0;
        this.stats.particlesRendered = 0;
        this.stats.drawCalls = 0;
        this.stats.verticesRendered = 0;
        this.stats.trianglesRendered = 0;
        this.stats.batchingTime = 0;
        this.stats.renderingTime = 0;
        this.stats.bufferTime = 0;
        this.stats.sortingTime = 0;
    }
    
    /**
     * Cleanup renderer resources
     */
    cleanup(): void {
        // Return batches to pool
        for (const batch of this.batchManager.activeBatches) {
            if (this.batchManager.batchPool.length < this.batchManager.maxBatches) {
                this.batchManager.batchPool.push(batch);
            }
        }
        
        this.batchManager.activeBatches.length = 0;
    }
}